import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { prisma } from "@/lib/prisma";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/game/[gameId]/next-round
 * 
 * Move to next round (host only)
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
 *   round: RoundState
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

    // Verify host
    const host: any = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!host || !host.isHost || host.gameId !== gameId) {
      return NextResponse.json(
        { error: "Only host can advance to next round" },
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
        { error: "Only host can advance to next round" },
        { status: 403 }
      );
    }

    // Check if there is a next round
    if (session.currentRoundIndex >= session.rounds.length - 1) {
      return NextResponse.json(
        { error: "No more rounds available" },
        { status: 400 }
      );
    }

    // Move to next round
    session.currentRoundIndex += 1;
    const nextRound = session.rounds[session.currentRoundIndex];

    // Reset question index to first question
    nextRound.currentQuestionIndex = 0;

    // Reset player answers
    Object.values(session.players).forEach((player) => {
      if (player.isActive) {
        player.currentAnswer = undefined;
        player.answerSubmittedAt = undefined;
      }
    });

    session.checkpoint = "ROUND_START";
    session.updatedAt = new Date();

    await GameStatePersistence.createCheckpoint(gameId, "ROUND_START");

    return NextResponse.json(
      {
        success: true,
        session,
        round: nextRound,
        roundNumber: nextRound.roundNumber,
        category: nextRound.category,
        totalRounds: session.rounds.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Game] Error moving to next round:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to advance round",
      },
      { status: 500 }
    );
  }
}
