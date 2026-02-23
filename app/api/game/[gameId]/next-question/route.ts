import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/game/[gameId]/next-question
 * 
 * Move to next question (host only)
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
 *   question: QuestionState
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
        { error: "Only host can advance questions" },
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
        { error: "Only host can advance questions" },
        { status: 403 }
      );
    }

    const currentRound = session.rounds[session.currentRoundIndex];
    if (!currentRound) {
      return NextResponse.json(
        { error: "No active round" },
        { status: 400 }
      );
    }

    // Check if we can move to next question
    if (
      currentRound.currentQuestionIndex >=
      currentRound.questions.length - 1
    ) {
      return NextResponse.json(
        { error: "No more questions in this round" },
        { status: 400 }
      );
    }

    GameStateManager.nextQuestion(gameId);

    const nextQuestion =
      currentRound.questions[currentRound.currentQuestionIndex];

    await GameStatePersistence.createCheckpoint(gameId, "QUESTION_ACTIVE");

    return NextResponse.json(
      {
        success: true,
        session,
        question: nextQuestion,
        currentQuestionIndex: currentRound.currentQuestionIndex,
        totalQuestions: currentRound.questions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Game] Error moving to next question:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to advance",
      },
      { status: 500 }
    );
  }
}
