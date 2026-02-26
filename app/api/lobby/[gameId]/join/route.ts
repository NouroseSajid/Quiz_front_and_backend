import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GameStateManager } from "@/lib/gameState";
import { createPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/lobby/[gameId]/join
 * 
 * Join an existing lobby
 * 
 * Body:
 * {
 *   playerName: string,
 *   gameCode?: string (optional, for validation)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   playerId: string,
 *   playerToken: string,
 *   session: GameStateSnapshot,
 *   players: PlayerState[]
 * }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params;
    const body = await request.json();
    const { playerName, gameCode } = body;

    if (!playerName || playerName.trim().length === 0) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    // Get game from database
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });
    
    // Get session separately
    const session = game
      ? await prisma.session.findUnique({
          where: { gameId },
        })
      : null;

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Validate game code if provided
    if (gameCode && game.code !== gameCode) {
      return NextResponse.json(
        { error: "Invalid game code" },
        { status: 400 }
      );
    }

    // Check if game is still in LOBBY status
    if (game.status !== "LOBBY") {
      return NextResponse.json(
        { error: "Game has already started" },
        { status: 400 }
      );
    }

    // Check session exists and is active
    if (!session || !session.isActive) {
      return NextResponse.json(
        { error: "Lobby is not active" },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existingPlayer = game.players.find(
      (p) => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Player name already taken in this game" },
        { status: 400 }
      );
    }

    const { token, salt, hash } = createPlayerToken();

    // Create player in database
    // @ts-ignore - silence missing authSalt/authHash in Prisma generated types
    const player = await prisma.player.create(
      {
        data: {
          name: playerName.trim(),
          gameId: game.id,
          isHost: false,
          isActive: true,
          authSalt: salt,
          authHash: hash,
        },
      } as any
    );

    // Add to in-memory session
    let gameSession = GameStateManager.getSession(gameId);

    if (!gameSession) {
      // Session not in memory, create from DB
      gameSession = GameStateManager.createSession(
        game.id,
        game.code,
        session!.hostId,
        (game.settings || {}) as Record<string, any>
      );

      // Add all existing players
      for (const dbPlayer of game!.players!) {
        GameStateManager.addPlayer(
          game.id,
          dbPlayer.id,
          dbPlayer.name,
          dbPlayer.isHost
        );
      }
    }

    // Add new player to in-memory session
    GameStateManager.addPlayer(
      gameId,
      player.id,
      playerName.trim(),
      false
    );

    const players = GameStateManager.getPlayers(gameId);

    return NextResponse.json(
      {
        success: true,
        playerId: player.id,
        playerToken: token,
        gameId: game.id,
        gameCode: game.code,
        session: GameStateManager.sanitizeSessionForPlayer(gameSession, player.id),
        players,
        playerCount: players.length,
        message: `Joined lobby! Waiting for host to start...`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Lobby] Error joining lobby:", error);
    return NextResponse.json(
      { error: "Failed to join lobby" },
      { status: 500 }
    );
  }
}
