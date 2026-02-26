import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
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
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    let session = GameStateManager.getSession(gameId);

    if (!session) {
      const recovered = await GameStatePersistence.ensureSession(gameId);
      session = recovered || undefined;
    }

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or expired" },
        { status: 404 }
      );
    }

    // Get players in-memory
    let players = GameStateManager.getPlayers(gameId);
    
    // If in-memory players don't match database, sync from database
    if (players.length !== game.players.length) {
      // Re-add all players from database
      game.players.forEach(dbPlayer => {
        const exists = players.find(p => p.id === dbPlayer.id);
        if (!exists) {
          GameStateManager.addPlayer(gameId, dbPlayer.id, dbPlayer.name, false);
        }
      });
      players = GameStateManager.getPlayers(gameId);
    }

    const playerId = request.nextUrl.searchParams.get("playerId") || "";

    return NextResponse.json({
      success: true,
      session: GameStateManager.sanitizeSessionForPlayer(session, playerId),
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
