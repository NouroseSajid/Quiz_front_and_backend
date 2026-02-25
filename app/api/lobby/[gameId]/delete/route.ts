import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { prisma } from "@/lib/prisma";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/lobby/[gameId]/delete
 *
 * Delete a lobby (host only)
 *
 * Body:
 * {
 *   playerId: string,
 *   playerToken: string
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

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { session: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "LOBBY") {
      return NextResponse.json(
        { error: "Only lobby games can be deleted" },
        { status: 400 }
      );
    }

    const host: any = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!host || !host.isHost || host.gameId !== gameId) {
      return NextResponse.json(
        { error: "Only host can delete the lobby" },
        { status: 403 }
      );
    }

    if (!verifyPlayerToken(playerToken, host.authSalt, host.authHash)) {
      return NextResponse.json(
        { error: "Invalid player token" },
        { status: 401 }
      );
    }

    GameStateManager.deleteSession(gameId);

    await prisma.game.delete({
      where: { id: gameId },
    });

    return NextResponse.json(
      { success: true, message: "Lobby deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Lobby] Error deleting lobby:", error);
    return NextResponse.json(
      { error: "Failed to delete lobby" },
      { status: 500 }
    );
  }
}
