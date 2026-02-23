import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/lobby/[gameId]
 * 
 * Get current lobby/game status
 * 
 * Response:
 * {
 *   success: boolean,
 *   session: GameStateSnapshot,
 *   players: PlayerState[],
 *   playerCount: number,
 *   isHost: boolean
 * }
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    let session = GameStateManager.getSession(gameId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or expired" },
        { status: 404 }
      );
    }

    const players = GameStateManager.getPlayers(gameId);

    return NextResponse.json({
      success: true,
      session,
      players,
      playerCount: players.length,
      gameCode: game.code,
      status: game.status,
    });
  } catch (error) {
    console.error("[Lobby] Error getting lobby status:", error);
    return NextResponse.json(
      { error: "Failed to get lobby status" },
      { status: 500 }
    );
  }
}
