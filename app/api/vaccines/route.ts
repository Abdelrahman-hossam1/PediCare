import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "RECEPTIONIST", "DOCTOR"].includes(String(user.role))) return forbidden();

    const vaccines = await prisma.vaccine.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        defaultPrice: true,
        availableFrom: true,
        availableTo: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vaccines);
  } catch (error) {
    console.error("GET /api/vaccines error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!["ADMIN", "RECEPTIONIST"].includes(String(user.role))) return forbidden();

  const CreateVaccineSchema = z.object({
    name: z.string().min(1),
    stock: z.coerce.number().int().nonnegative(),
    defaultPrice: z.coerce.number().int().nonnegative(),
    availableFrom: z.string().optional(),
    availableTo: z.string().optional(),
  });

  const body = await req.json().catch(() => null);
  const parsed = CreateVaccineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, stock, defaultPrice, availableFrom, availableTo } = parsed.data;

  const vaccine = await prisma.vaccine.create({
    data: {
      name,
      stock,
      defaultPrice,
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      availableTo: availableTo ? new Date(availableTo) : null
    }
  });

  return NextResponse.json(vaccine, { status: 201 });
}
