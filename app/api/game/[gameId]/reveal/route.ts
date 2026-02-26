import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyHost } from "@/lib/playerAuth";
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

    if (!(await verifyHost(prisma, gameId, playerId, playerToken))) {
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

    // Prepare results map
    const finalResults: Record<string, number> = {};

    // Load WASM for enhanced scoring calculations
    let wasmLoaded = false;
    try {
      await loadScoreWasm();
      wasmLoaded = true;
      console.log("[Game] WASM scoring engine loaded for question reveal");
    } catch (err) {
      console.warn("[Game] WASM scoring failed to load", err);
    }

    // Apply scoring if provided by host
    if (results && Array.isArray(results)) {
      for (const result of results) {
        if (result.playerId && result.pointsEarned !== undefined) {
          finalResults[result.playerId] = result.pointsEarned;
          GameStateManager.updatePlayerScore(
            gameId,
            result.playerId,
            result.pointsEarned
          );
        }
      }
    } else {
      // Auto-calculate for all players
      const answers = currentQuestion.answers || {};
      for (const [pid, answer] of Object.entries(answers)) {
        let points = 0;
        
        // Use WASM for complex scoring if available
        if (wasmLoaded && currentQuestion.type === "GEO") {
          const correct = currentQuestion.correct as any;
          points = await calculateGeoScore(
            answer.lat, answer.lng,
            correct.lat, correct.lng,
            currentQuestion.metadata?.radius || 500,
            currentQuestion.pointsMax,
            0, // For reveal we don't necessarily have time here, or could use stored time
            currentQuestion.timeLimit
          );
        } else if (JSON.stringify(answer) === JSON.stringify(currentQuestion.correct)) {
          points = currentQuestion.pointsMax;
        }

        if (points > 0) {
          finalResults[pid] = Math.round(points);
          GameStateManager.updatePlayerScore(gameId, pid, Math.round(points));
        }
      }
    }

    // Attach results to question for client-side display
    currentQuestion.results = finalResults;

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
