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
    // Fetch all lobbies with status 'LOBBY'
    const lobbies = await prisma.game.findMany({
      where: { status: "LOBBY" },
      include: { players: true },
    });

    // Map lobbies to a simplified structure
    const lobbyList = lobbies.map((lobby) => ({
      id: lobby.id,
      code: lobby.code,
      playerCount: lobby.players.length,
    }));

    return NextResponse.json({ success: true, lobbies: lobbyList });
  } catch (error) {
    console.error("[Lobby] Failed to fetch lobbies:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch lobbies" }, { status: 500 });
  }
}