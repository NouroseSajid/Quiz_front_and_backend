import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { prisma } from "@/lib/prisma";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/lobby/[gameId]/start
 * 
 * Host starts the game
 * 
 * Body:
 * {
 *   playerId: string (must be host),
 *   playerToken: string,
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
    const { playerId, playerToken, roundIds } = body;

    if (!playerId || !playerToken) {
      return NextResponse.json(
        { error: "Player ID and token are required" },
        { status: 400 }
      );
    }

    // Verify player is host
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player || !player.isHost || player.gameId !== gameId) {
      return NextResponse.json(
        { error: "Only host can start the game" },
        { status: 403 }
      );
    }

    if (!verifyPlayerToken(playerToken, player.authSalt, player.authHash)) {
      return NextResponse.json(
        { error: "Invalid player token" },
        { status: 401 }
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
            include: { questions: true },
          },
        },
      });
    } else {
      game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          rounds: {
            include: { questions: true },
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

    if (game.rounds.length === 0) {
      return NextResponse.json(
        { error: "No rounds available for this game" },
        { status: 400 }
      );
    }

    // Get in-memory session
    const session = GameStateManager.getSession(gameId);
    if (!session) {
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
    const questionIds = firstRound.questions.map((q) => q.id);

    const roundState = GameStateManager.startRound(
      gameId,
      firstRound.id,
      firstRound.roundNumber,
      firstRound.category,
      questionIds
    );

    // Create checkpoint for game start
    await GameStatePersistence.createCheckpoint(gameId, "ROUND_START");

    return NextResponse.json(
      {
        success: true,
        session,
        firstRound: roundState,
        playerCount: Object.values(session.players).filter((p) => p.isActive)
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
