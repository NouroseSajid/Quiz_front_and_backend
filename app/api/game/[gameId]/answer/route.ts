import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyPlayerToken } from "@/lib/playerAuth";
import { loadScoreWasm, validateAnswerSubmission } from "@/lib/scoreWasm";
import { validateAnswer } from "@/lib/answerValidation";

/**
 * POST /api/game/[gameId]/answer
 * 
 * Player submits an answer to current question
 * 
 * Body (application/json):
 * {
 *   playerId: string,
 *   playerToken: string,
 *   answer: any (depends on question type)
 * }
 * 
 * Body (multipart/form-data for file uploads):
 * - playerId
 * - playerToken
 * - answer (JSON stringified)
 * - file (optional, for TASK type photo)
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
    
    let playerId: string | undefined;
    let playerToken: string | undefined;
    let answer: any;
    let uploadedFileUrl: string | undefined;

    // Handle both JSON and FormData
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      playerId = formData.get("playerId") as string;
      playerToken = formData.get("playerToken") as string;
      const answerStr = formData.get("answer") as string;
      answer = answerStr ? JSON.parse(answerStr) : null;
      
      const file = formData.get("file") as File | null;
      if (file) {
        uploadedFileUrl = await uploadFile(file);
        if (answer && typeof answer === "object") {
          answer.fileUrl = uploadedFileUrl;
        }
      }
    } else {
      const body = await request.json();
      playerId = body.playerId;
      playerToken = body.playerToken;
      answer = body.answer;
    }

    if (!playerId || !playerToken) {
      return NextResponse.json(
        { error: "Player ID and token are required" },
        { status: 400 }
      );
    }

    const player: any = await prisma.player.findUnique({
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

    const currentQuestion = currentRound.questions[currentRound.currentQuestionIndex];
    if (!currentQuestion) {
      return NextResponse.json(
        { error: "No active question" },
        { status: 400 }
      );
    }

    // ✅ NEW: Validate answer format before accepting
    const validation = validateAnswer(answer, currentQuestion.type as any, currentQuestion.metadata || {});
    if (!validation.valid) {
      console.warn(`[Game] Answer validation failed for player ${playerId}:`, validation.error);
      return NextResponse.json(
        { 
          error: validation.error,
          code: validation.code,
        },
        { status: 400 }
      );
    }

    const normalizedAnswer = validation.normalizedAnswer;

    // Submit answer using normalized, validated answer
    GameStateManager.submitPlayerAnswer(gameId, playerId, normalizedAnswer);

    // Update player last seen
    GameStateManager.updatePlayerLastSeen(gameId, playerId);

    // Save to database
    try {
      const timeMs = Math.round(new Date().getTime() - new Date(currentQuestion.startedAt).getTime());
      
      // Load WASM for answer validation (async, non-blocking)
      try {
        await loadScoreWasm();
        // Validate answer submission using WASM (with JS fallback)
        const isValid = await validateAnswerSubmission(
          timeMs,
          (currentQuestion.timeLimit || 60) * 1000,
          JSON.stringify(normalizedAnswer)
        );
        if (!isValid) {
          console.warn(`[Game] Answer validation failed for player ${playerId}`);
          // Continue anyway - host can manually review
        }
      } catch (err) {
        console.warn("[Game] WASM validation skipped, using JS fallback", err);
      }

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
          submitted: normalizedAnswer,
          timeMs,
        },
        update: {
          submitted: normalizedAnswer,
          timeMs,
        },
      });
    } catch (dbError) {
      console.error("[Game] Error saving answer to DB:", dbError);
      // Continue anyway - in-memory state is primary
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

/**
 * Upload file to storage (stub - implement with your storage service)
 * This is a placeholder for S3, Vercel Blob, or similar
 */
async function uploadFile(file: File): Promise<string> {
  try {
    // For now, return a placeholder URL
    // In production, upload to S3/Vercel Blob Storage
    console.log(`[Upload] Processing file: ${file.name} (${file.size} bytes)`);
    
    // ✅ TODO: Implement real file upload
    // Example with Vercel Blob:
    // const blob = await put(file.name, file, { access: 'public' });
    // return blob.url;
    
    // Placeholder - return data URL for small files
    if (file.size < 5 * 1024 * 1024) { // < 5MB
      return URL.createObjectURL(file);
    }
    
    throw new Error("File upload not yet implemented - use client-side upload");
  } catch (err) {
    console.error("[Upload] Error:", err);
    throw new Error("Failed to upload file");
  }
}

