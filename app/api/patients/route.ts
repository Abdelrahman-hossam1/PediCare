import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canRead, canWrite } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

const PatientCreateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().datetime(),

  phone: z.string().min(8),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  address: z.string().optional(),

  bloodType: z
    .enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"])
    .optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canRead(user.role)) return unauthorized();

    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("GET /api/patients error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canWrite(user.role)) return forbidden();

    const body = await req.json();
    const parsed = PatientCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const patient = await prisma.patient.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("POST /api/patients error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
