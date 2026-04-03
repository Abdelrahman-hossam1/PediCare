import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/api/auth/login",
    "/api/auth/register",
    "/api/dev", // Dev routes (remove in production)
  ];

  const isPublicRoute =
    pathname === "/" ||
    publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");

  // ✅ For both pages and API routes, we require a valid token
  const token = request.cookies.get("token")?.value;

  // If no token
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const decoded = await verifyAuthToken(token);

  // If token is invalid
  if (!decoded) {
    if (isApiRoute) {
      const res = NextResponse.json({ message: "Invalid token" }, { status: 401 });
      res.cookies.delete("token");
      return res;
    }

    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("token");
    return response;
  }

  // ✅ Inject user info into headers so route handlers can RBAC safely
  const requestHeaders = new Headers(request.headers);

  // Adjust these keys based on what verifyAuthToken returns
  const userId = (decoded as any).userId ?? (decoded as any).id ?? "";
  const role = (decoded as any).role ?? "";
  const email = (decoded as any).email ?? "";

  requestHeaders.set("x-user-id", String(userId));
  requestHeaders.set("x-user-role", String(role));
  requestHeaders.set("x-user-email", String(email));

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth/login (public)
     * - api/auth/register (public)
     * - api/dev (public, dev only)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api/auth/login|api/auth/register|api/dev|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
