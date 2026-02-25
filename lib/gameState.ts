/**
 * In-Memory Game State Manager
 * 
 * This module manages all active game sessions in RAM for performance.
 * State is automatically backed up to the database for crash recovery.
 * 
 * Architecture:
 * - Sessions are stored in a Map<gameId, GameSession>
 * - Each session holds current state (players, scores, current question, etc.)
 * - Changes are batched and persisted to DB asynchronously
 */

export interface PlayerState {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  isActive: boolean;
  lastSeen: Date;
  currentAnswer?: any;
  answerSubmittedAt?: Date;
}

export interface QuestionState {
  id: string;
  roundNumber: number;
  questionIndex: number;
  text: string;
  type: string;
  timeLimit: number;
  pointsMax: number;
  startedAt: Date;
  endedAt?: Date;
  revealed: boolean;
  answers: Record<string, any>; // playerId -> answer
  metadata?: Record<string, any>; // MCQ options, RANGE min/max, GEO scope, etc
}

export interface RoundState {
  id: string;
  roundNumber: number;
  category: string;
  status: "ACTIVE" | "COMPLETE";
  questions: QuestionState[];
  currentQuestionIndex: number;
}

export interface GameStateSnapshot {
  gameId: string;
  code: string;
  hostId: string;
  status: "LOBBY" | "PLAYING" | "PAUSED" | "COMPLETED";
  players: Record<string, PlayerState>; // playerId -> PlayerState
  rounds: RoundState[];
  currentRoundIndex: number;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  checkpoint: "LOBBY" | "ROUND_START" | "QUESTION_ACTIVE" | "QUESTION_RESULTS" | "ROUND_RESULTS" | "GAME_END";
}

// Singleton instance to store all active sessions
const activeSessions = new Map<string, GameStateSnapshot>();

export class GameStateManager {
  /**
   * Create a new game session
   */
  static createSession(
    gameId: string,
    code: string,
    hostId: string,
    settings?: Record<string, any>
  ): GameStateSnapshot {
    const session: GameStateSnapshot = {
      gameId,
      code,
      hostId,
      status: "LOBBY",
      players: {},
      rounds: [],
      currentRoundIndex: 0,
      settings: settings || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      checkpoint: "LOBBY",
    };

    activeSessions.set(gameId, session);
    return session;
  }

  /**
   * Get a session by game ID
   */
  static getSession(gameId: string): GameStateSnapshot | undefined {
    return activeSessions.get(gameId);
  }

  /**
   * Add a player to the session
   */
  static addPlayer(
    gameId: string,
    playerId: string,
    name: string,
    isHost: boolean = false
  ): PlayerState {
    const session = activeSessions.get(gameId);
    if (!session) {
      throw new Error(`Session not found: ${gameId}`);
    }

    const player: PlayerState = {
      id: playerId,
      name,
      isHost,
      score: 0,
      isActive: true,
      lastSeen: new Date(),
    };

    session.players[playerId] = player;
    session.updatedAt = new Date();

    console.log(`[GameState] Added player ${name} (${playerId}) to session ${gameId}. Total players: ${Object.keys(session.players).length}`);

    return player;
  }

  /**
   * Remove a player from the session (keep in DB)
   */
  static removePlayer(gameId: string, playerId: string): void {
    const session = activeSessions.get(gameId);
    if (!session) return;

    if (session.players[playerId]) {
      session.players[playerId].isActive = false;
      session.updatedAt = new Date();
    }
  }

  /**
   * Get all players in a session
   */
  static getPlayers(gameId: string): PlayerState[] {
    const session = activeSessions.get(gameId);
    if (!session) {
      console.log(`[GameState] getPlayers called but no session found for ${gameId}`);
      return [];
    }
    const playerArray = Object.values(session.players);
    console.log(`[GameState] getPlayers returning ${playerArray.length} players for ${gameId}`);
    return playerArray;
  }

  /**
   * Update player answer for current question
   */
  static submitPlayerAnswer(
    gameId: string,
    playerId: string,
    answer: any
  ): void {
    const session = activeSessions.get(gameId);
    if (!session) throw new Error(`Session not found: ${gameId}`);

    const player = session.players[playerId];
    if (!player) throw new Error(`Player not found: ${playerId}`);

    const currentRound = session.rounds[session.currentRoundIndex];
    if (!currentRound) throw new Error("No active round");

    const currentQuestion =
      currentRound.questions[currentRound.currentQuestionIndex];
    if (!currentQuestion) throw new Error("No active question");

    player.currentAnswer = answer;
    player.answerSubmittedAt = new Date();
    currentQuestion.answers[playerId] = answer;
    session.updatedAt = new Date();
  }

  /**
   * Start a new round
   */
  static startRound(
    gameId: string,
    roundId: string,
    roundNumber: number,
    category: string,
    questions: Array<{
      id: string;
      questionIndex: number;
      text: string;
      type: string;
      timeLimit: number;
      pointsMax: number;
      metadata?: Record<string, any>;
    }>
  ): RoundState {
    const session = activeSessions.get(gameId);
    if (!session) throw new Error(`Session not found: ${gameId}`);

    const round: RoundState = {
      id: roundId,
      roundNumber,
      category,
      status: "ACTIVE",
      questions: questions.map((q, idx) => ({
        id: q.id,
        roundNumber,
        questionIndex: q.questionIndex ?? idx,
        text: q.text,
        type: q.type,
        timeLimit: q.timeLimit,
        pointsMax: q.pointsMax,
        metadata: q.metadata,
        startedAt: new Date(),
        revealed: false,
        answers: {},
      })),
      currentQuestionIndex: 0,
    };

    session.rounds.push(round);
    session.currentRoundIndex = session.rounds.length - 1;
    session.status = "PLAYING";
    session.checkpoint = "ROUND_START";
    session.updatedAt = new Date();

    // Reset player answers for the new round
    Object.values(session.players).forEach((player) => {
      if (player.isActive) {
        player.currentAnswer = undefined;
        player.answerSubmittedAt = undefined;
      }
    });

    return round;
  }

  /**
   * Move to next question
   */
  static nextQuestion(gameId: string): void {
    const session = activeSessions.get(gameId);
    if (!session) throw new Error(`Session not found: ${gameId}`);

    const currentRound = session.rounds[session.currentRoundIndex];
    if (!currentRound) throw new Error("No active round");

    currentRound.currentQuestionIndex += 1;

    const nextQuestion =
      currentRound.questions[currentRound.currentQuestionIndex];
    if (nextQuestion) {
      nextQuestion.startedAt = new Date();
      nextQuestion.revealed = false;
      nextQuestion.answers = {};
    }

    // Reset player answers for new question
    Object.values(session.players).forEach((player) => {
      if (player.isActive) {
        player.currentAnswer = undefined;
        player.answerSubmittedAt = undefined;
      }
    });

    session.checkpoint = "QUESTION_ACTIVE";
    session.updatedAt = new Date();
  }

  /**
   * Reveal question results
   */
  static revealQuestion(gameId: string): void {
    const session = activeSessions.get(gameId);
    if (!session) throw new Error(`Session not found: ${gameId}`);

    const currentRound = session.rounds[session.currentRoundIndex];
    if (!currentRound) throw new Error("No active round");

    const currentQuestion =
      currentRound.questions[currentRound.currentQuestionIndex];
    if (!currentQuestion) throw new Error("No active question");

    currentQuestion.revealed = true;
    currentQuestion.endedAt = new Date();
    session.checkpoint = "QUESTION_RESULTS";
    session.updatedAt = new Date();
  }

  /**
   * Complete a round
   */
  static completeRound(gameId: string): void {
    const session = activeSessions.get(gameId);
    if (!session) throw new Error(`Session not found: ${gameId}`);

    const currentRound = session.rounds[session.currentRoundIndex];
    if (!currentRound) throw new Error("No active round");

    currentRound.status = "COMPLETE";
    session.checkpoint = "ROUND_RESULTS";
    session.updatedAt = new Date();
  }

  /**
   * End the game
   */
  static endGame(gameId: string): void {
    const session = activeSessions.get(gameId);
    if (!session) throw new Error(`Session not found: ${gameId}`);

    session.status = "COMPLETED";
    session.checkpoint = "GAME_END";
    session.updatedAt = new Date();
  }

  /**
   * Update player score
   */
  static updatePlayerScore(
    gameId: string,
    playerId: string,
    pointsEarned: number
  ): void {
    const session = activeSessions.get(gameId);
    if (!session) throw new Error(`Session not found: ${gameId}`);

    const player = session.players[playerId];
    if (!player) throw new Error(`Player not found: ${playerId}`);

    player.score += pointsEarned;
    session.updatedAt = new Date();
  }

  /**
   * Get leaderboard for current session
   * Uses memoization to avoid repeated sorting if nothing changed
   */
  static getLeaderboard(gameId: string): PlayerState[] {
    const session = activeSessions.get(gameId);
    if (!session) return [];

    const activePlayers = Object.values(session.players).filter((p) => p.isActive);
    
    // Return cached result if state hasn't changed
    const sessionAny = session as any;
    if (
      sessionAny._leaderboardCache?.timestamp === session.updatedAt?.getTime() &&
      sessionAny._leaderboardCache?.length === activePlayers.length
    ) {
      return sessionAny._leaderboardCache.data;
    }

    // Recompute leaderboard
    const sorted = [...activePlayers].sort((a, b) => b.score - a.score);
    
    // Cache result
    sessionAny._leaderboardCache = {
      data: sorted,
      timestamp: session.updatedAt?.getTime(),
      length: activePlayers.length,
    };

    return sorted;
  }

  /**
   * Remove inactive sessions (cleanup)
   */
  static cleanupInactiveSessions(maxIdleMs: number = 3600000): void {
    // Default: 1 hour
    const now = new Date();
    const toDelete: string[] = [];

    activeSessions.forEach((session, gameId) => {
      const idleTime = now.getTime() - session.updatedAt.getTime();
      if (idleTime > maxIdleMs && session.status === "COMPLETED") {
        toDelete.push(gameId);
      }
    });

    toDelete.forEach((gameId) => activeSessions.delete(gameId));
  }

  /**
   * Get all active sessions (for debugging/monitoring)
   */
  static getAllSessions(): GameStateSnapshot[] {
    return Array.from(activeSessions.values());
  }

  /**
   * Load session from database backup (crash recovery)
   */
  static loadFromBackup(backup: GameStateSnapshot): void {
    activeSessions.set(backup.gameId, backup);
  }

  /**
   * Export session for backup
   */
  static exportSession(gameId: string): GameStateSnapshot | null {
    const session = activeSessions.get(gameId);
    return session ? { ...session } : null;
  }

  /**
   * Delete session from memory
   */
  static deleteSession(gameId: string): void {
    activeSessions.delete(gameId);
  }

  /**
   * Update player last seen timestamp (for connection tracking)
   */
  static updatePlayerLastSeen(gameId: string, playerId: string): void {
    const session = activeSessions.get(gameId);
    if (!session) return;

    const player = session.players[playerId];
    if (player) {
      player.lastSeen = new Date();
      session.updatedAt = new Date();
    }
  }
}
