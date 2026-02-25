import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_token";

/**
 * Validate admin credentials against .env values
 */
export function validateAdminCredentials(username: string, password: string): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

/**
 * Generate a simple admin token (hash of username+password+secret)
 */
export function generateAdminToken(): string {
  const raw = `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}:admin_secret`;
  // Simple base64 token — not cryptographically secure but fine for local/dev admin
  return Buffer.from(raw).toString("base64");
}

/**
 * Verify an admin token is valid
 */
export function verifyAdminToken(token: string): boolean {
  return token === generateAdminToken();
}

/**
 * Check if the current request has a valid admin cookie (for server components / route handlers)
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    return verifyAdminToken(token);
  } catch {
    return false;
  }
}

/**
 * Check admin auth from a request (for API routes)
 * Uses Next.js cookies() for reliable cookie access
 */
export async function isAdminFromRequest(request: Request): Promise<boolean> {
  // Check Authorization header first
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    if (verifyAdminToken(token)) return true;
  }

  // Check cookie using Next.js cookies() API
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (token && verifyAdminToken(token)) {
      return true;
    }
  } catch (err) {
    console.error("[adminAuth] Error reading cookies:", err);
  }

  return false;
}

export { ADMIN_COOKIE };
