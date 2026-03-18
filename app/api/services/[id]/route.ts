import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "DOCTOR"].includes(String(user.role))) return forbidden();

    const { id } = await ctx.params;

    const UpdateServiceSchema = z.object({
      name: z.string().min(1).optional(),
      defaultPrice: z.coerce.number().int().nonnegative().optional(),
      isActive: z.coerce.boolean().optional(),
    });

    const body = await req.json().catch(() => null);
    const parsed = UpdateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.service.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Service name already exists" }, { status: 409 });
    }
    console.error("PATCH /api/services/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

