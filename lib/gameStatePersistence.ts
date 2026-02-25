/**
 * Game State Persistence Service
 * 
 * Handles:
 * - Periodic backups of game state to database
 * - Recovery from database backups on app startup
 * - Crash recovery and session restoration
 * - Cleanup of old backups
 */

import { prisma } from "@/lib/prisma";
import { GameStateManager, GameStateSnapshot } from "@/lib/gameState";

const backupsEnabled = () => process.env.GAME_STATE_BACKUPS_ENABLED !== "0";

let backupInterval: NodeJS.Timeout | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export class GameStatePersistence {
  /**
   * Ensure the service is initialized (lazy initialization)
   */
  private static async ensureInitialized(): Promise<void> {
    if (isInitialized) return;
    
    // If already initializing, wait for it
    if (initializationPromise) {
      await initializationPromise;
      return;
    }
    
    // Start initialization
    initializationPromise = this.initialize();
    await initializationPromise;
    initializationPromise = null;
  }

  /**
   * Initialize persistence service on app startup
   * - Recover any orphaned sessions from database
   * - Set up periodic backup intervals
   */
  static async initialize(): Promise<void> {
    if (isInitialized) return;
    
    try {
      // Recover active sessions from database
      await this.recoverSessions();

      if (!backupsEnabled()) {
        this.stopPeriodicBackups();
        console.log("[GameState] Backups disabled via env");
      } else {
        // Start periodic backups (every 30 seconds)
        this.startPeriodicBackups(30000);
      }

      isInitialized = true;
      console.log("[GameState] Persistence service initialized");
    } catch (error) {
      console.error("[GameState] Failed to initialize persistence:", error);
    }
  }

  /**
   * Save current game state snapshot to database
   */
  static async backupSession(gameId: string): Promise<void> {
    if (!backupsEnabled()) return;
    try {
      const session = GameStateManager.exportSession(gameId);
      if (!session) return;

      // Store backup in database
      await prisma.gameStateBackup.create({
        data: {
          gameId,
          state: session as any, // JSON serialization
          checkpoint: session.checkpoint,
          version: 1,
        },
      });
    } catch (error) {
      console.error(`[GameState] Failed to backup session ${gameId}:`, error);
    }
  }

  /**
   * Backup all active sessions
   */
  static async backupAllSessions(): Promise<void> {
    const sessions = GameStateManager.getAllSessions();

    for (const session of sessions) {
      await this.backupSession(session.gameId);
    }
  }

  /**
   * Recover session from latest backup in database
   */
  static async recoverSession(gameId: string): Promise<GameStateSnapshot | null> {
    try {
      const backup = await prisma.gameStateBackup.findFirst({
        where: { gameId },
        orderBy: { createdAt: "desc" },
      });

      if (!backup || !backup.state) {
        return null;
      }

      // Restore to memory
      const state = (backup.state as unknown as GameStateSnapshot);
      GameStateManager.loadFromBackup(state);

      console.log(`[GameState] Recovered session ${gameId} from backup`);
      return state;
    } catch (error) {
      console.error(`[GameState] Failed to recover session ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Recover all orphaned sessions from database on startup
   */
  static async recoverSessions(): Promise<void> {
    try {
      // Find all active sessions that are not COMPLETED
      const sessions = await prisma.session.findMany({
        where: {
          isActive: true,
          status: { not: "COMPLETED" },
        },
        include: {
          game: {
            include: {
              players: true,
            },
          },
        },
      });

      for (const session of sessions) {
        // Try to recover from backup
        const recovered = await this.recoverSession(session.gameId);

        if (recovered) {
          console.log(
            `[GameState] Recovered session ${session.gameId} from backup`
          );
        } else {
          // Create fresh session from database data
          await this.createSessionFromDatabase(session);
        }
      }

      console.log(`[GameState] Recovered ${sessions.length} sessions`);
    } catch (error) {
      console.error("[GameState] Failed to recover sessions:", error);
    }
  }

  /**
   * Create in-memory session from database records
   */
  static async createSessionFromDatabase(dbSession: any): Promise<void> {
    try {
      const { game, hostId } = dbSession;

      const session = GameStateManager.createSession(
        game.id,
        game.code,
        hostId,
        game.settings
      );

      // Add players from database
      for (const dbPlayer of game.players) {
        GameStateManager.addPlayer(
          game.id,
          dbPlayer.id,
          dbPlayer.name,
          false // Players are no longer hosts
        );

        // Update score and status
        const player = session.players[dbPlayer.id];
        if (player) {
          player.score = dbPlayer.score;
          player.isActive = dbPlayer.isActive;
        }
      }

      console.log(
        `[GameState] Loaded ${game.players.length} players from database for ${game.id}`
      );

      session.status = dbSession.status;

      // If game is ACTIVE, restore rounds and questions from database
      if (game.status === "ACTIVE" && dbSession.status === "PLAYING") {
        const dbGame = await prisma.game.findUnique({
          where: { id: game.id },
          include: {
            rounds: {
              include: {
                questions: {
                  orderBy: { questionIndex: "asc" },
                },
              },
              orderBy: { roundNumber: "asc" },
            },
          },
        });

        if (dbGame && dbGame.rounds.length > 0) {
          // Restore the first round (or find the active round)
          const firstRound = dbGame.rounds[0];
          const questionData = firstRound.questions.map((q) => ({
            id: q.id,
            questionIndex: q.questionIndex ?? 0,
            text: q.text,
            type: q.type,
            timeLimit: q.timeLimit,
            pointsMax: q.pointsMax,
            metadata: q.metadata as Record<string, any> | undefined,
          }));

          GameStateManager.startRound(
            game.id,
            firstRound.id,
            firstRound.roundNumber,
            firstRound.category,
            questionData
          );

          console.log(`[GameState] Restored rounds from database for ${game.id}`);
        }
      }

      console.log(
        `[GameState] Created session ${game.id} from database records`
      );
    } catch (error) {
      console.error("[GameState] Failed to create session from DB:", error);
    }
  }

  /**
   * Ensure a session exists in memory, attempting recovery or DB rebuild.
   */
  static async ensureSession(gameId: string): Promise<GameStateSnapshot | null> {
    await this.ensureInitialized();
    
    const existing = GameStateManager.getSession(gameId);
    if (existing) return existing;

    const recovered = await this.recoverSession(gameId);
    if (recovered) return recovered;

    const dbSession = await prisma.session.findUnique({
      where: { gameId },
      include: {
        game: {
          include: {
            players: true,
          },
        },
      },
    });

    if (!dbSession || !dbSession.isActive || dbSession.status === "COMPLETED") {
      return null;
    }

    await this.createSessionFromDatabase(dbSession);
    return GameStateManager.getSession(gameId) ?? null;
  }

  /**
   * Mark session as completed and finalize
   */
  static async finalizeSession(gameId: string): Promise<void> {
    try {
      // Save final backup
      await this.backupSession(gameId);

      // Mark session as completed
      await prisma.session.update({
        where: { gameId },
        data: {
          status: "COMPLETED",
          isActive: false,
        },
      });

      // Remove from memory after a delay
      setTimeout(() => {
        GameStateManager.deleteSession(gameId);
      }, 5000);

      console.log(`[GameState] Finalized session ${gameId}`);
    } catch (error) {
      console.error(`[GameState] Failed to finalize session ${gameId}:`, error);
    }
  }

  /**
   * Start periodic backup interval
   */
  static startPeriodicBackups(intervalMs: number = 30000): void {
    if (!backupsEnabled()) {
      this.stopPeriodicBackups();
      console.log("[GameState] Backups disabled via env");
      return;
    }
    if (backupInterval) clearInterval(backupInterval);

    backupInterval = setInterval(async () => {
      await this.backupAllSessions();
    }, intervalMs);

    console.log(`[GameState] Periodic backups started (every ${intervalMs}ms)`);
  }

  /**
   * Stop periodic backups
   */
  static stopPeriodicBackups(): void {
    if (backupInterval) {
      clearInterval(backupInterval);
      backupInterval = null;
    }
  }

  /**
   * Cleanup old backups (keep last N backups per game, delete old ones)
   */
  static async cleanupOldBackups(
    maxBackupsPerGame: number = 5,
    maxAgeMs: number = 86400000 // 24 hours
  ): Promise<void> {
    if (!backupsEnabled()) return;
    try {
      const now = new Date(Date.now() - maxAgeMs);

      // Delete old backups
      const result = await prisma.gameStateBackup.deleteMany({
        where: {
          createdAt: { lt: now },
        },
      });

      console.log(`[GameState] Cleaned up ${result.count} old backups`);
    } catch (error) {
      console.error("[GameState] Failed to cleanup old backups:", error);
    }
  }

  /**
   * Get backup history for a game
   */
  static async getBackupHistory(gameId: string, limit: number = 10) {
    try {
      return await prisma.gameStateBackup.findMany({
        where: { gameId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (error) {
      console.error("[GameState] Failed to get backup history:", error);
      return [];
    }
  }

  /**
   * Create a manual checkpoint
   */
  static async createCheckpoint(
    gameId: string,
    checkpoint: string
  ): Promise<void> {
    if (!backupsEnabled()) return;
    try {
      const session = GameStateManager.exportSession(gameId);
      if (!session) return;

      // Create backup with specific checkpoint
      await prisma.gameStateBackup.create({
        data: {
          gameId,
          state: session as any, // JSON serialization
          checkpoint,
          version: 1,
        },
      });

      console.log(`[GameState] Created checkpoint "${checkpoint}" for ${gameId}`);
    } catch (error) {
      console.error(`[GameState] Failed to create checkpoint:`, error);
    }
  }

  /**
   * Restore to a specific checkpoint
   */
  static async restoreCheckpoint(
    gameId: string,
    checkpointId: string
  ): Promise<GameStateSnapshot | null> {
    try {
      const backup = await prisma.gameStateBackup.findUnique({
        where: { id: checkpointId },
      });

      if (!backup || backup.gameId !== gameId) {
        throw new Error("Checkpoint not found");
      }

      const state = (backup.state as unknown as GameStateSnapshot);
      GameStateManager.loadFromBackup(state);

      console.log(`[GameState] Restored from checkpoint ${checkpointId}`);
      return state;
    } catch (error) {
      console.error(
        `[GameState] Failed to restore checkpoint ${checkpointId}:`,
        error
      );
      return null;
    }
  }
}
