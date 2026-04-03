import { cookies } from "next/headers";
import { verifyAuthToken, type TokenPayload } from "@/lib/auth";

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) return decodeURIComponent(part.slice(name.length + 1));
  }
  return null;
}

/**
 * Best-practice helper:
 * - In Route Handlers, pass `req` and we read the already-verified user headers set by `proxy.ts`.
 * - In Server Components, call with no args and we read `cookies()` and verify the token.
 */
export async function getCurrentUser(req?: Request): Promise<TokenPayload | null> {
  if (req) {
    const id = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    const email = req.headers.get("x-user-email");
    if (id && role && email) return { id, role, email };

    // Fallback if proxy didn't run (or headers missing): verify from cookie header
    const token = getCookieValue(req.headers.get("cookie"), "token");
    if (!token) return null;
    return await verifyAuthToken(token);
  }

  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  return await verifyAuthToken(token);
}