import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth, errorResponse } from "@/lib/api-auth";

// GET /api/me — current authenticated user (from cookie/header token)
export async function GET(request: Request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ user: null }, { status: 401 });
    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: { id: true, name: true, email: true, role: true, phone: true, profileImage: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
