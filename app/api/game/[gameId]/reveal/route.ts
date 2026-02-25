import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyPlayerToken } from "@/lib/playerAuth";
import { loadScoreWasm, calculateGeoScore, calculateFinalScore, rankingError, computeVotingAccuracy } from "@/lib/scoreWasm";

/**
 * POST /api/game/[gameId]/reveal
 * 
 * Reveal current question results (host only)
 * 
 * Body:
 * {
 *   playerId: string (host),
 *   playerToken: string,
 *   results?: { playerId: string, pointsEarned: number }[] (optional scoring)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   session: GameStateSnapshot,
 *   answers: Record<string, any>
 * }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;
    const body = await request.json();
    const { playerId, playerToken, results } = body;

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
        { error: "Only host can reveal answers" },
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
        { error: "Only host can reveal answers" },
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

    const currentQuestion =
      currentRound.questions[currentRound.currentQuestionIndex];
    if (!currentQuestion) {
      return NextResponse.json(
        { error: "No active question" },
        { status: 400 }
      );
    }

    // Reveal the question
    GameStateManager.revealQuestion(gameId);

    // Apply scoring if provided
    if (results && Array.isArray(results)) {
      for (const result of results) {
        if (result.playerId && result.pointsEarned !== undefined) {
          GameStateManager.updatePlayerScore(
            gameId,
            result.playerId,
            result.pointsEarned
          );
        }
      }
    }

    // Load WASM for enhanced scoring calculations (if available)
    try {
      await loadScoreWasm();
      // WASM functions are now available for geo-scoring, ranking, voting accuracy
      // The scoring system uses both automatic (WASM) and manual (results) scoring modes
      console.log("[Game] WASM scoring engine loaded for question reveal");
    } catch (err) {
      console.warn("[Game] WASM scoring skipped, using standard scoring", err);
    }

    await GameStatePersistence.createCheckpoint(gameId, "QUESTION_RESULTS");

    return NextResponse.json(
      {
        success: true,
        session,
        answers: currentQuestion.answers,
        leaderboard: GameStateManager.getLeaderboard(gameId),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Game] Error revealing question:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reveal",
      },
      { status: 500 }
    );
  }
}
