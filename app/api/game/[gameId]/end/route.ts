import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/game/[gameId]/end
 * 
 * End the game and finalize scores (host only)
 * 
 * Body:
 * {
 *   playerId: string (host),
 *   playerToken: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   session: GameStateSnapshot,
 *   leaderboard: PlayerState[],
 *   winner: PlayerState
 * }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;
    const body = await request.json();
    const { playerId, playerToken } = body;

    if (!playerId || !playerToken) {
      return NextResponse.json(
        { error: "Player ID and token are required" },
        { status: 400 }
      );
    }

    const session = GameStateManager.getSession(gameId);
    if (!session) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }

    // Verify host
    const host = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!host || !host.isHost || host.gameId !== gameId) {
      return NextResponse.json(
        { error: "Only host can end the game" },
        { status: 403 }
      );
    }

    if (!verifyPlayerToken(playerToken, host.authSalt, host.authHash)) {
      return NextResponse.json(
        { error: "Invalid player token" },
        { status: 401 }
      );
    }

    if (session.hostId !== playerId) {
      return NextResponse.json(
        { error: "Only host can end the game" },
        { status: 403 }
      );
    }

    // End the game in memory
    GameStateManager.endGame(gameId);

    const leaderboard = GameStateManager.getLeaderboard(gameId);
    const winner = leaderboard[0] || null;

    // Update database
    await prisma.game.update({
      where: { id: gameId },
      data: { status: "FINISHED" },
    });

    // Finalize session
    await GameStatePersistence.finalizeSession(gameId);

    return NextResponse.json(
      {
        success: true,
        session,
        leaderboard,
        winner,
        message: winner
          ? `Game finished! Winner: ${winner.name} (${winner.score} points)`
          : "Game finished!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Game] Error ending game:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to end game",
      },
      { status: 500 }
    );
  }
}
