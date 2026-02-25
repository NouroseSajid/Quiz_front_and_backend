import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { isAdminFromRequest } from "@/lib/adminAuth";
import { randomUUID } from "crypto";

/**
 * POST /api/admin/create-game
 * 
 * Create a new game session (admin only)
 * The admin becomes the host but is NOT a player
 * 
 * Headers:
 *   Authorization: Bearer <admin-token>
 * 
 * Body:
 * {
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
 *   hostId: string,
 *   hostToken: string,
 *   session: GameStateSnapshot
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const isAdmin = await isAdminFromRequest(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    // Generate a unique game code
    const gameCode = generateGameCode();
    // Generate a unique host ID
    const hostId = randomUUID();

    // Create game in database
    const game = await prisma.game.create({
      data: {
        code: gameCode,
        status: "LOBBY",
        settings: settings || {},
      },
    });

    // Create session in database (host is NOT a player)
    const session = await prisma.session.create({
      data: {
        gameId: game.id,
        hostId: hostId,
        status: "LOBBY",
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour expiry
      },
    });

    // Initialize in-memory session
    const gameSession = GameStateManager.createSession(
      game.id,
      gameCode,
      hostId,
      (settings || {}) as Record<string, any>
    );

    // Create initial backup
    await GameStatePersistence.backupSession(game.id);

    return NextResponse.json(
      {
        success: true,
        gameId: game.id,
        code: gameCode,
        hostId: hostId,
        hostToken: "host-token-" + hostId, // In production, use proper signed tokens
        session: gameSession,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin] Failed to create game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
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
