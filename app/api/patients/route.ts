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

const PatientDeleteSchema = z.object({
  id: z.string().min(1, "Patient id is required"),
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

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canWrite(user.role)) return forbidden();

    const url = new URL(req.url);
    const idFromQuery = url.searchParams.get("id");

    const body = idFromQuery ? null : await req.json().catch(() => null);
    const parsed = PatientDeleteSchema.safeParse({ id: idFromQuery ?? body?.id });

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id } = parsed.data;

    const deleted = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.findUnique({ where: { id } });
      if (!patient) return null;

      // Restore vaccine stock for any vaccine items on this patient's invoices
      const vaccineItems = await tx.invoiceItem.findMany({
        where: {
          type: "VACCINE",
          vaccineId: { not: null },
          invoice: { appointment: { patientId: id } },
        },
        select: { vaccineId: true, quantity: true },
      });

      const increments = new Map<string, number>();
      for (const item of vaccineItems) {
        if (!item.vaccineId) continue;
        increments.set(item.vaccineId, (increments.get(item.vaccineId) ?? 0) + item.quantity);
      }

      for (const [vaccineId, qty] of increments) {
        await tx.vaccine.update({
          where: { id: vaccineId },
          data: { stock: { increment: qty } },
        });
      }

      // Delete children first (no cascade specified in schema)
      await tx.payment.deleteMany({ where: { invoice: { appointment: { patientId: id } } } });
      await tx.invoiceItem.deleteMany({ where: { invoice: { appointment: { patientId: id } } } });
      await tx.invoice.deleteMany({ where: { appointment: { patientId: id } } });
      await tx.medicalRecord.deleteMany({ where: { patientId: id } });
      await tx.appointment.deleteMany({ where: { patientId: id } });
      await tx.patient.delete({ where: { id } });

      return patient;
    });

    if (!deleted) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Patient deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/patients error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
