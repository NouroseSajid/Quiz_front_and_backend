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
