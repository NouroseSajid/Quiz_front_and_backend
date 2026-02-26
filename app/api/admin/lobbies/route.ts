import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminFromRequest } from "@/lib/adminAuth";
import { GameStateManager } from "@/lib/gameState";

/**
 * GET /api/admin/lobbies
 * List all games (for admin management), excluding the ADMIN question bank
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const games = await prisma.game.findMany({
      where: { code: { not: "ADMIN" } },
      include: { players: true, session: true, rounds: { include: { questions: true } } },
      orderBy: { createdAt: "desc" },
    });

    const lobbies = games.map((g) => {
      const activePlayers = g.players.filter((p) => p.isActive);
      const host = g.players.find((p) => p.isHost);
      const questionCount = g.rounds.reduce((sum, r) => sum + r.questions.length, 0);
      return {
        id: g.id,
        code: g.code,
        status: g.status,
        createdAt: g.createdAt,
        playerCount: g.players.length,
        activePlayerCount: activePlayers.length,
        hostName: host?.name ?? null,
        roundCount: g.rounds.length,
        questionCount,
        sessionActive: g.session?.isActive ?? false,
        players: g.players.map((p) => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isActive: p.isActive,
          score: 0,
        })),
      };
    });

    return NextResponse.json({ success: true, lobbies });
  } catch (error) {
    console.error("[Admin] Failed to fetch lobbies:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/lobbies
 * Delete a game by id (admin power — any game, any status)
 * Body: { gameId: string }
 */
export async function DELETE(request: NextRequest) {
  if (!(await isAdminFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { gameId } = await request.json();
    if (!gameId) {
      return NextResponse.json({ error: "gameId is required" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    if (game.code === "ADMIN") {
      return NextResponse.json({ error: "Cannot delete the ADMIN question bank" }, { status: 400 });
    }

    // Remove from in-memory state
    try { GameStateManager.deleteSession(gameId); } catch { /* ignore */ }

    // Cascade delete (Prisma handles related records)
    await prisma.game.delete({ where: { id: gameId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin] Failed to delete game:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
