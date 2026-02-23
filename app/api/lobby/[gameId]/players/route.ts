import { NextRequest, NextResponse } from "next/server";
import { GameStateManager } from "@/lib/gameState";

/**
 * GET /api/lobby/[gameId]/players
 * 
 * Get all players in a game
 * 
 * Response:
 * {
 *   success: boolean,
 *   players: PlayerState[],
 *   leaderboard: PlayerState[]
 * }
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;

    const players = GameStateManager.getPlayers(gameId);
    const leaderboard = GameStateManager.getLeaderboard(gameId);

    return NextResponse.json(
      {
        success: true,
        players,
        leaderboard,
        playerCount: players.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Lobby] Error getting players:", error);
    return NextResponse.json(
      { error: "Failed to get players" },
      { status: 500 }
    );
  }
}
