import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GameStateManager } from "@/lib/gameState";
import { verifyPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/lobby/[gameId]/rejoin
 *
 * Rejoin an existing lobby/game session
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
 *   session?: GameStateSnapshot
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

    // Validate player and token
    // cast to any so we can read authSalt/authHash
    const player: any = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player || player.gameId !== gameId) {
      return NextResponse.json(
        { error: "Invalid player ID" },
        { status: 401 }
      );
    }

    if (!verifyPlayerToken(playerToken, player.authSalt, player.authHash)) {
      return NextResponse.json(
        { error: "Invalid player token" },
        { status: 401 }
      );
    }

    await prisma.player.update({
      where: { id: playerId },
      data: { isActive: true },
    });

    // Validate game session
    const session = GameStateManager.getSession(gameId);

    if (!session) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }

    // Re-add player to in-memory session
    GameStateManager.addPlayer(
      gameId,
      player.id,
      player.name,
      player.isHost
    );

    return NextResponse.json(
      {
        success: true,
        session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Lobby] Failed to rejoin lobby:", error);
    return NextResponse.json(
      { error: "Failed to rejoin lobby" },
      { status: 500 }
    );
  }
}
