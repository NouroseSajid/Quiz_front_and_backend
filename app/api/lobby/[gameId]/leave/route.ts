import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { prisma } from "@/lib/prisma";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/lobby/[gameId]/leave
 * 
 * Player leaves the game/lobby
 * 
 * Body:
 * {
 *   playerId: string,
 *   playerToken: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string
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

    // Update in memory
    GameStateManager.removePlayer(gameId, playerId);

    // Update in database
    await prisma.player.update({
      where: { id: playerId },
      data: { isActive: false },
    });

    // Backup current state
    await GameStatePersistence.backupSession(gameId);

    return NextResponse.json(
      {
        success: true,
        message: "Left the game",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Lobby] Error leaving game:", error);
    return NextResponse.json(
      { error: "Failed to leave game" },
      { status: 500 }
    );
  }
}
