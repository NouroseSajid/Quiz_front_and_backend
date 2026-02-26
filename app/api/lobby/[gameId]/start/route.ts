import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { prisma } from "@/lib/prisma";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { verifyPlayerToken } from "@/lib/playerAuth";
import { isAdminFromRequest } from "@/lib/adminAuth";

/**
 * POST /api/lobby/[gameId]/start
 * 
 * Admin starts the game (admin only)
 * 
 * Headers:
 *   Authorization: Bearer <admin-token> (or admin cookie)
 * 
 * Body:
 * {
 *   roundIds?: string[] (specific rounds to play)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   session: GameStateSnapshot,
 *   firstRound: RoundState
 * }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;
    const body = await request.json();
    const { roundIds } = body;
    const isAdmin = await isAdminFromRequest(request);

    // Only admins can start games
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can start games" },
        { status: 403 }
      );
    }

    // Verify the game exists
    const session = await prisma.session.findUnique({
      where: { gameId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }

    // Get game and rounds - handle specific rounds or all rounds
    let game;
    if (roundIds && roundIds.length > 0) {
      game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          rounds: {
            where: { id: { in: roundIds } },
            include: { questions: { orderBy: { questionIndex: "asc" } } },
          },
        },
      });
    } else {
      game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          rounds: {
            include: { questions: { orderBy: { questionIndex: "asc" } } },
          },
        },
      });
    }

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    const totalQuestions = game.rounds.reduce(
      (sum, round) => sum + (round.questions?.length || 0),
      0
    );

    // If no rounds or no questions on this game, copy from the ADMIN question bank
    if (game.rounds.length === 0 || totalQuestions === 0) {
      if (game.rounds.length > 0) {
        await prisma.round.deleteMany({ where: { gameId } });
      }
      const adminGame = await prisma.game.findFirst({
        where: { code: "ADMIN" },
        include: {
          rounds: {
            include: { questions: { orderBy: { questionIndex: "asc" } } },
          },
        },
      });

      if (!adminGame || adminGame.rounds.length === 0) {
        return NextResponse.json(
          { error: "No questions in the question bank. Add questions via Admin > Add Questions first." },
          { status: 400 }
        );
      }

      // Copy each round and its questions into this game
      for (const srcRound of adminGame.rounds) {
        const newRound = await prisma.round.create({
          data: {
            gameId: game.id,
            roundNumber: srcRound.roundNumber,
            category: srcRound.category,
            status: "ACTIVE",
          },
        });

        // Limit to 25 random questions from the source round to keep the Jeopardy board manageable
        const shuffledQuestions = [...srcRound.questions].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffledQuestions.slice(0, 25);

        for (let i = 0; i < selectedQuestions.length; i++) {
          const srcQ = selectedQuestions[i];
          await prisma.question.create({
            data: {
              roundId: newRound.id,
              type: srcQ.type,
              text: srcQ.text,
              media: srcQ.media,
              correct: srcQ.correct ?? undefined,
              metadata: srcQ.metadata ?? undefined,
              pointsMax: srcQ.pointsMax,
              timeLimit: srcQ.timeLimit,
              questionIndex: i, // Use the new index in the subset
            },
          });
        }
      }

      // Re-fetch the game with the newly copied rounds
      game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          rounds: {
            include: { questions: { orderBy: { questionIndex: "asc" } } },
          },
        },
      });

      if (!game || game.rounds.length === 0) {
        return NextResponse.json(
          { error: "Failed to set up rounds for this game" },
          { status: 500 }
        );
      }
    }

    // Get in-memory session
    const gameSession = GameStateManager.getSession(gameId);
    if (!gameSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Update database game status
    await prisma.game.update({
      where: { id: gameId },
      data: { status: "ACTIVE" },
    });

    // Update session in database
    await prisma.session.update({
      where: { gameId },
      data: { status: "PLAYING" },
    });

    // Start first round in memory
    const firstRound = game.rounds[0];
    const questionData = firstRound.questions.map((q) => ({
      id: q.id,
      questionIndex: q.questionIndex ?? 0,
      text: q.text,
      type: q.type,
      timeLimit: q.timeLimit,
      pointsMax: q.pointsMax,
      metadata: q.metadata as Record<string, any> | undefined,
    }));

    const roundState = GameStateManager.startRound(
      gameId,
      firstRound.id,
      firstRound.roundNumber,
      firstRound.category,
      questionData
    );

    // Create checkpoint for game start
    await GameStatePersistence.createCheckpoint(gameId, "QUESTION_ACTIVE");

    return NextResponse.json(
      {
        success: true,
        session: GameStateManager.sanitizeSessionForPlayer(gameSession, gameSession.hostId),
        firstRound: roundState,
        playerCount: Object.values(gameSession.players).filter((p) => p.isActive)
          .length,
        message: "Game started!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Lobby] Error starting game:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
