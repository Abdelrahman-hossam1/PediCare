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

    const UpdateVaccineSchema = z.object({
      name: z.string().min(1).optional(),
      manufacturer: z.string().min(1).optional().nullable(),
      stock: z.coerce.number().int().nonnegative().optional(),
      defaultPrice: z.coerce.number().int().nonnegative().optional(),
      availableFrom: z.string().optional().nullable(),
      availableTo: z.string().optional().nullable(),
    });

    const body = await req.json().catch(() => null);
    const parsed = UpdateVaccineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updated = await prisma.vaccine.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.manufacturer !== undefined ? { manufacturer: data.manufacturer } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.defaultPrice !== undefined ? { defaultPrice: data.defaultPrice } : {}),
        ...(data.availableFrom !== undefined
          ? { availableFrom: data.availableFrom ? new Date(data.availableFrom) : null }
          : {}),
        ...(data.availableTo !== undefined
          ? { availableTo: data.availableTo ? new Date(data.availableTo) : null }
          : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/vaccines/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

