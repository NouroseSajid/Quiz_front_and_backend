import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/game/[gameId]/answer
 * 
 * Player submits an answer to current question
 * 
 * Body:
 * {
 *   playerId: string,
 *   playerToken: string,
 *   answer: any (depends on question type)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   submitted: boolean,
 *   session: GameStateSnapshot
 * }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;
    const body = await request.json();
    const { playerId, playerToken, answer } = body;

    if (!playerId || !playerToken) {
      return NextResponse.json(
        { error: "Player ID and token are required" },
        { status: 400 }
      );
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player || player.gameId !== gameId) {
      return NextResponse.json(
        { error: "Invalid player" },
        { status: 401 }
      );
    }

    if (!verifyPlayerToken(playerToken, player.authSalt, player.authHash)) {
      return NextResponse.json(
        { error: "Invalid player token" },
        { status: 401 }
      );
    }

    const session = GameStateManager.getSession(gameId);
    if (!session) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }

    // Submit answer
    GameStateManager.submitPlayerAnswer(gameId, playerId, answer);

    // Update player last seen
    GameStateManager.updatePlayerLastSeen(gameId, playerId);

    // Save to database
    const currentRound = session.rounds[session.currentRoundIndex];
    if (currentRound) {
      const currentQuestion =
        currentRound.questions[currentRound.currentQuestionIndex];
      if (currentQuestion) {
        try {
          await prisma.answer.upsert({
            where: {
              questionId_playerId: {
                questionId: currentQuestion.id,
                playerId,
              },
            },
            create: {
              questionId: currentQuestion.id,
              playerId,
              submitted: answer,
              timeMs: Math.round(
                (new Date().getTime() - currentQuestion.startedAt.getTime())
              ),
            },
            update: {
              submitted: answer,
              timeMs: Math.round(
                (new Date().getTime() - currentQuestion.startedAt.getTime())
              ),
            },
          });
        } catch (dbError) {
          console.error("[Game] Error saving answer to DB:", dbError);
          // Continue anyway - in-memory state is primary
        }
      }
    }

    // Periodic backup
    await GameStatePersistence.backupSession(gameId);

    return NextResponse.json(
      {
        success: true,
        submitted: true,
        session,
        message: "Answer submitted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Game] Error submitting answer:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit answer",
      },
      { status: 500 }
    );
  }
}
