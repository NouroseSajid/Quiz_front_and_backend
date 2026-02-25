import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/lobby
 *
 * Fetch all open lobbies
 *
 * Response:
 * {
 *   success: boolean,
 *   lobbies: Array<{ id: string, code: string, playerCount: number }>
 * }
 */
export async function GET() {
  try {
    // Fetch all lobbies with status 'LOBBY', excluding the internal ADMIN question bank
    const lobbies = await prisma.game.findMany({
      where: { status: "LOBBY", code: { not: "ADMIN" } },
      include: { players: true, session: true },
    });

    // Map lobbies to a simplified structure
    const lobbyList = lobbies.map((lobby) => {
      const activePlayerCount = lobby.players.filter((p) => p.isActive).length;
      // A lobby is active if the session is active (doesn't require players to join)
      const isActive = Boolean(lobby.session?.isActive);
      return {
        id: lobby.id,
        code: lobby.code,
        playerCount: lobby.players.length,
        activePlayerCount,
        isActive,
      };
    });

    return NextResponse.json({ success: true, lobbies: lobbyList });
  } catch (error) {
    console.error("[Lobby] Failed to fetch lobbies:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch lobbies" }, { status: 500 });
  }
}