import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyHost } from "@/lib/playerAuth";

/**
 * POST /api/game/[gameId]/next-question
 * 
 * Move to next question or specific question (host only)
 * 
 * Body:
 * {
 *   playerId: string (host),
 *   playerToken: string,
 *   targetQuestionIndex?: number (optional, to jump to specific question)
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
    const { playerId, playerToken, targetQuestionIndex } = body;

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

    if (!(await verifyHost(prisma, gameId, playerId, playerToken))) {
      return NextResponse.json(
        { error: "Only host can advance questions" },
        { status: 403 }
      );
    }

    // Get fresh session reference
    const activeSession = GameStateManager.getSession(gameId);
    if (!activeSession) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }

    const currentRound = activeSession.rounds[activeSession.currentRoundIndex];
    if (!currentRound) {
      return NextResponse.json(
        { error: "No active round" },
        { status: 400 }
      );
    }

    // Validate target question index if provided
    if (targetQuestionIndex !== undefined) {
      if (typeof targetQuestionIndex !== "number" || targetQuestionIndex < 0 || targetQuestionIndex >= currentRound.questions.length) {
        return NextResponse.json(
          { error: "Invalid target question index" },
          { status: 400 }
        );
      }
    } else {
      // Check if we can move to next question (default behavior)
      if (currentRound.currentQuestionIndex >= currentRound.questions.length - 1) {
        return NextResponse.json(
          { error: "No more questions in this round" },
          { status: 400 }
        );
      }
    }

    GameStateManager.nextQuestion(gameId, targetQuestionIndex);

    // Persist BEFORE returning to ensure consistency
    await GameStatePersistence.createCheckpoint(gameId, "QUESTION_ACTIVE");

    // Get updated session after persistence
    const updatedSession = GameStateManager.getSession(gameId);
    if (!updatedSession) {
      return NextResponse.json(
        { error: "Session lost after question advance" },
        { status: 500 }
      );
    }

    const updatedRound = updatedSession.rounds[updatedSession.currentRoundIndex];
    const nextQuestion =
      updatedRound.questions[updatedRound.currentQuestionIndex];

    return NextResponse.json(
      {
        success: true,
        session: updatedSession,
        question: nextQuestion,
        currentQuestionIndex: updatedRound.currentQuestionIndex,
        totalQuestions: updatedRound.questions.length,
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
