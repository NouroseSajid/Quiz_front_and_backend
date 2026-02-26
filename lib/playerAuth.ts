import crypto from "crypto";

const TOKEN_BYTES = 16;
const SALT_BYTES = 16;

export function createPlayerToken() {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const hash = hashToken(token, salt);
  return { token, salt, hash };
}

export function verifyPlayerToken(
  token: string,
  salt?: string | null,
  hash?: string | null
) {
  if (!token || !salt || !hash) return false;
  const candidate = hashToken(token, salt);
  return safeEqual(candidate, hash);
}

function hashToken(token: string, salt: string) {
  return crypto.createHash("sha256").update(`${salt}:${token}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Verify if a playerId and playerToken are authorized as a host for a specific game
 */
export async function verifyHost(
  prisma: any,
  gameId: string,
  playerId: string,
  playerToken: string
): Promise<boolean> {
  if (!gameId || !playerId || !playerToken) return false;

  // 1. Try verifying as a Player who has isHost=true
  const host: any = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (host && host.isHost && host.gameId === gameId) {
    if (verifyPlayerToken(playerToken, host.authSalt, host.authHash)) {
      return true;
    }
  }

  // 2. Fallback: Verify as Session Host (admins who created game but didn't join)
  const dbSession = await prisma.session.findUnique({
    where: { gameId },
  });

  if (dbSession && dbSession.hostId === playerId) {
    // For admin hosts, we use the simple token defined in create-game
    if (playerToken === `host-token-${playerId}`) {
      return true;
    }
  }

  return false;
}
