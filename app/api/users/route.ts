import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

/**
 * GET /api/users
 * Returns a list of all users.
 * Restricted to ADMIN role.
 */
export async function GET(request: NextRequest) {
    try {
        const decoded = await getCurrentUser(request);

        if (!decoded || decoded.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized. Admin role required." },
                { status: 403 }
            );
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
