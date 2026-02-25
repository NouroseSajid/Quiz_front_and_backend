import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminFromRequest } from "@/lib/adminAuth";
import { GameStateManager } from "@/lib/gameState";

/**
 * POST /api/admin/kick
 * Admin power to kick any player from any lobby
 * Body: { gameId: string, playerId: string }
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { gameId, playerId } = await request.json();

    if (!gameId || !playerId) {
      return NextResponse.json(
        { error: "gameId and playerId are required" },
        { status: 400 }
      );
    }

    // Verify game and player exist
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const player = game.players.find((p) => p.id === playerId);
    if (!player) {
      return NextResponse.json({ error: "Player not found in this game" }, { status: 404 });
    }

    // Don't allow kicking the host if there are other players
    if (player.isHost && game.players.length > 1) {
      return NextResponse.json(
        { error: "Cannot kick host while other players remain. Delete the lobby instead." },
        { status: 400 }
      );
    }

    // Remove from in-memory session
    try {
      GameStateManager.removePlayer(gameId, playerId);
    } catch (err) {
      console.log("Player not in memory session (might be in DB only)");
    }

    // Mark as inactive in database (soft kick)
    await prisma.player.update({
      where: { id: playerId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: `Kicked ${player.name} from ${game.code}`,
    });
  } catch (error) {
    console.error("[Admin] Failed to kick player:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
