import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GameStateManager } from "@/lib/gameState";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/lobby/{gameId}/kick
 *
 * Remove a player from the lobby (host only)
 *
 * Request Body:
 * {
 *   hostId: string,
 *   hostToken: string,
 *   playerId: string
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
  context: { params: { gameId: string } }
) {
  try {
    const { gameId } = context.params;
    const body = await request.json();
    const { hostId, hostToken, playerId } = body;

    if (!hostId || !hostToken || !playerId) {
      return NextResponse.json(
        { error: "Host ID, host token, and player ID are required" },
        { status: 400 }
      );
    }

    // Validate the game and host
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { gameId },
    });

    const host = await prisma.player.findUnique({
      where: { id: hostId },
    });

    if (!session || !host || session.hostId !== hostId || !host.isHost) {
      return NextResponse.json(
        { error: "Only the host can kick players" },
        { status: 403 }
      );
    }

    if (!verifyPlayerToken(hostToken, host.authSalt, host.authHash)) {
      return NextResponse.json(
        { error: "Invalid host token" },
        { status: 401 }
      );
    }

    // Remove the player from the database
    await prisma.player.delete({
      where: { id: playerId },
    });

    // Remove the player from the in-memory session
    GameStateManager.removePlayer(gameId, playerId);

    return NextResponse.json({
      success: true,
      message: "Player removed from the lobby",
    });
  } catch (error) {
    console.error("[Lobby] Failed to kick player:", error);
    return NextResponse.json(
      { error: "Failed to kick player" },
      { status: 500 }
    );
  }
}