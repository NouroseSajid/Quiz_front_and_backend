import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyHost } from "@/lib/playerAuth";

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

    if (!(await verifyHost(prisma, gameId, playerId, playerToken))) {
      return NextResponse.json(
        { error: "Only host can end the game" },
        { status: 403 }
      );
    }

    let session = GameStateManager.getSession(gameId);
    if (!session) {
      // Try to recover session
      const recovered = await GameStatePersistence.ensureSession(gameId);
      session = recovered || undefined;
      if (!session) {
        return NextResponse.json(
          { error: "Game session not found" },
          { status: 404 }
        );
      }
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
