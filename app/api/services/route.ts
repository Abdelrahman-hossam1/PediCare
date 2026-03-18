import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "DOCTOR"].includes(String(user.role))) return forbidden();

    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        defaultPrice: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "DOCTOR"].includes(String(user.role))) return forbidden();

    const CreateServiceSchema = z.object({
      name: z.string().min(1),
      defaultPrice: z.coerce.number().int().nonnegative(),
      isActive: z.coerce.boolean().optional(),
    });

    const body = await req.json().catch(() => null);
    const parsed = CreateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const created = await prisma.service.create({
      data: {
        name: parsed.data.name,
        defaultPrice: parsed.data.defaultPrice,
        isActive: parsed.data.isActive ?? true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    // Prisma unique constraint error (service name)
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Service name already exists" }, { status: 409 });
    }
    console.error("POST /api/services error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

