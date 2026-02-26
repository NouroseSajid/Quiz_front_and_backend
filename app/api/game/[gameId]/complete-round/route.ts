import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyHost } from "@/lib/playerAuth";

/**
 * POST /api/game/[gameId]/complete-round
 * 
 * End current round and prepare for next one (host only)
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
 *   nextRoundIndex: number | null
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
        { error: "Only host can complete rounds" },
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

    const currentRound = session.rounds[session.currentRoundIndex];
    if (!currentRound) {
      return NextResponse.json(
        { error: "No active round" },
        { status: 400 }
      );
    }

    // Complete the round
    GameStateManager.completeRound(gameId);

    const leaderboard = GameStateManager.getLeaderboard(gameId);

    // Check if there are more rounds
    const hasMoreRounds = session.currentRoundIndex < session.rounds.length - 1;

    let nextRoundIndex = null;
    if (hasMoreRounds) {
      nextRoundIndex = session.currentRoundIndex + 1;
    }

    await GameStatePersistence.createCheckpoint(gameId, "ROUND_RESULTS");

    return NextResponse.json(
      {
        success: true,
        session,
        leaderboard,
        nextRoundIndex,
        hasMoreRounds,
        message: hasMoreRounds
          ? "Round complete! Ready for next round."
          : "Round complete! Game is finished.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Game] Error completing round:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to complete round",
      },
      { status: 500 }
    );
  }
}
