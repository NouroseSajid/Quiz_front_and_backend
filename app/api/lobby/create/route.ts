import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { createPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/lobby/create
 * 
 * Create a new lobby/game session
 * 
 * Body:
 * {
 *   playerName: string,
 *   settings?: {
 *     maxPlayers?: number,
 *     roundCount?: number,
 *     autoStart?: boolean
 *   }
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   gameId: string,
 *   code: string,
 *   playerId: string,
 *   playerToken: string,
 *   session: GameStateSnapshot
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, settings } = body;

    if (!playerName || playerName.trim().length === 0) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    // Generate a unique game code (e.g., "FUN42")
    const gameCode = generateGameCode();

    const { token, salt, hash } = createPlayerToken();

    // Create game in database
    const game = await prisma.game.create({
      data: {
        code: gameCode,
        status: "LOBBY",
        settings: settings || {},
      },
    });

    // Create host player
    // @ts-ignore - authSalt/authHash are part of the schema but the generated
    // @ts-ignore - silence missing authSalt/authHash in Prisma generated types
    const player = await prisma.player.create(
      {
        data: {
          name: playerName.trim(),
          gameId: game.id,
          isHost: true,
          isActive: true,
          authSalt: salt,
          authHash: hash,
        },
      } as any
    );

    // Create session in database
    const session = await prisma.session.create({
      data: {
        gameId: game.id,
        hostId: player.id,
        status: "LOBBY",
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour expiry
      },
    });

    // Initialize in-memory session
    const gameSession = GameStateManager.createSession(
      game.id,
      gameCode,
      player.id,
      (settings || {}) as Record<string, any>
    );

    // Add host to in-memory session
    GameStateManager.addPlayer(
      game.id,
      player.id,
      playerName.trim(),
      true
    );

    // Create initial backup
    await GameStatePersistence.backupSession(game.id);

    return NextResponse.json(
      {
        success: true,
        gameId: game.id,
        code: gameCode,
        playerId: player.id,
        playerToken: token,
        session: gameSession,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Lobby] Failed to create lobby:", error);
    return NextResponse.json(
      { error: "Failed to create lobby" },
      { status: 500 }
    );
  }
}

/**
 * Generate a unique 6-character alphanumeric code for game access
 * Format: E.g., "FUN42", "QUIZ99"
 */
function generateGameCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
