import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GameStateManager } from "@/lib/gameState";
import { createPlayerToken } from "@/lib/playerAuth";

/**
 * POST /api/lobby/join
 * 
 * Join an existing game by game code
 * 
 * Body:
 * {
 *   gameCode: string,
 *   playerName: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   gameId: string,
 *   playerId: string,
 *   playerToken: string,
 *   session: GameStateSnapshot
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameCode, playerName } = body;

    if (!gameCode || gameCode.trim().length === 0) {
      return NextResponse.json(
        { error: "Game code is required" },
        { status: 400 }
      );
    }

    if (!playerName || playerName.trim().length === 0) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    // Find game by code
    const game = await prisma.game.findUnique({
      where: { code: gameCode.trim().toUpperCase() },
      include: { players: true, session: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found. Check the game code." },
        { status: 404 }
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
    if (!game.session || !game.session.isActive) {
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
    const player = await prisma.player.create(
      {
        data: {
          name: playerName.trim(),
          gameId: game.id,
          isActive: true,
          authSalt: salt,
          authHash: hash,
        },
      } as any
    );

    // Get in-memory session
    let gameSession = GameStateManager.getSession(game.id);
    
    // If not in memory, reconstruct from DB
    if (!gameSession) {
      gameSession = GameStateManager.createSession(
        game.id,
        game.code,
        game.session!.hostId,
        game.settings as Record<string, any>
      );
    }

    // Add player to in-memory session
    GameStateManager.addPlayer(
      game.id,
      player.id,
      playerName.trim(),
      false // Not a host
    );

    return NextResponse.json(
      {
        success: true,
        gameId: game.id,
        playerId: player.id,
        playerToken: token,
        session: gameSession,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Lobby] Failed to join lobby:", error);
    return NextResponse.json(
      { error: "Failed to join lobby" },
      { status: 500 }
    );
  }
}
