import { NextResponse } from "next/server";
import { verifyToken, getCookie, getTokenFromHeader, type JWTPayload } from "@/lib/auth";

/** Verify the auth token from the `token` cookie or Authorization header. */
export function getAuth(request: Request): JWTPayload | null {
  const cookieToken = getCookie(request.headers.get("cookie") ?? undefined, "token");
  const headerToken = getTokenFromHeader(request.headers.get("authorization") ?? undefined);
  const token = cookieToken ?? headerToken;
  if (!token) return null;
  return verifyToken(token);
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function requireRole(
  request: Request,
  roles: Array<"ADMIN" | "CUSTOMER" | "VENDOR">
): JWTPayload {
  const auth = getAuth(request);
  if (!auth) throw new AuthError("Please log in to continue", 401);
  if (!roles.includes(auth.role)) throw new AuthError("You do not have permission for this action", 403);
  return auth;
}

export function errorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("API error:", error);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}
