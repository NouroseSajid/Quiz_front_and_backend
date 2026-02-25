import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { prisma } from "@/lib/prisma";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/game/[gameId]/score
 *
 * Adjust a player's score (host only). The body may include either a `delta`
 * value or a `newScore` target; if both are provided delta takes precedence.
 *
 * Body:
 * {
 *   playerId: string (host),
 *   playerToken: string,
 *   targetPlayerId: string,
 *   delta?: number,
 *   newScore?: number
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   session?: GameStateSnapshot,
 *   updatedScore?: number
 * }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;
    const body = await request.json();
    const { playerId, playerToken, targetPlayerId, delta, newScore } = body;

    if (!playerId || !playerToken || !targetPlayerId) {
      return NextResponse.json(
        { error: "Player ID, token and target player ID are required" },
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

    // verify host privileges
    // note: `authSalt`/`authHash` are not included in the generated type by Prisma
    // so cast to any to allow token verification.
    const host: any = await prisma.player.findUnique({ where: { id: playerId } });
    if (!host || !host.isHost || host.gameId !== gameId) {
      return NextResponse.json(
        { error: "Only host can modify scores" },
        { status: 403 }
      );
    }

    if (!verifyPlayerToken(playerToken, host.authSalt, host.authHash)) {
      return NextResponse.json(
        { error: "Invalid player token" },
        { status: 401 }
      );
    }

    // determine delta
    let actualDelta: number | undefined = undefined;
    if (typeof delta === "number") {
      actualDelta = delta;
    } else if (typeof newScore === "number") {
      const current = session.players[targetPlayerId]?.score;
      if (current === undefined) {
        return NextResponse.json(
          { error: "Target player not found" },
          { status: 404 }
        );
      }
      actualDelta = newScore - current;
    }

    if (actualDelta === undefined) {
      return NextResponse.json(
        { error: "Either delta or newScore must be provided" },
        { status: 400 }
      );
    }

    GameStateManager.updatePlayerScore(gameId, targetPlayerId, actualDelta);

    await GameStateManager.getSession(gameId)?.players[targetPlayerId];

    // optionally persist a checkpoint so modifications are tracked
    GameStatePersistence.createCheckpoint(gameId, "ROUND_RESULTS");

    const updatedScore = session.players[targetPlayerId]?.score;

    return NextResponse.json({ success: true, session, updatedScore }, { status: 200 });
  } catch (error) {
    console.error("[Game] Error adjusting score:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Score update failed",
      },
      { status: 500 }
    );
  }
}
