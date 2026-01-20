import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

const UpdateMedicalRecordSchema = z.object({
  diagnosis: z.string().optional(),
  symptoms: z.string().optional(),
  treatmentPlan: z.string().optional(),
  notes: z.string().optional(),
});

const canWriteMedical = (role: string) => ["ADMIN", "DOCTOR"].includes(role);
const canReadMedical = (role: string) => ["ADMIN", "DOCTOR", "RECEPTIONIST"].includes(role);

async function isAppointmentLocked(appointmentId: string | null) {
  if (!appointmentId) return false;
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true },
  });
  return appt?.status === "COMPLETED";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canReadMedical(user.role)) return forbidden();

    const { id } = await params;
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        doctor: { select: { id: true, email: true } },
        appointment: { select: { id: true, startsAt: true, status: true } },
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      },
    });

    if (!record) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Doctors can read only their own records
    if (user.role === "DOCTOR" && record.doctorId !== user.id) return forbidden();

    return NextResponse.json(record);
  } catch (error) {
    console.error("GET /api/medical-records/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canWriteMedical(user.role)) return forbidden();

    const { id } = await params;
    const existing = await prisma.medicalRecord.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Doctors can edit only their own records (admin can edit anything)
    if (user.role === "DOCTOR" && existing.doctorId !== user.id) return forbidden();

    // Lock applies to non-admin users only
    if (user.role !== "ADMIN" && (await isAppointmentLocked(existing.appointmentId ?? null))) {
      return NextResponse.json({ message: "Medical record is locked (appointment completed)" }, { status: 409 });
    }

    const body = await req.json();
    const parsed = UpdateMedicalRecordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.medicalRecord.update({
      where: { id },
      data: parsed.data,
      include: { doctor: { select: { id: true, email: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/medical-records/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canWriteMedical(user.role)) return forbidden();

    const { id } = await params;
    const existing = await prisma.medicalRecord.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

    if (user.role === "DOCTOR" && existing.doctorId !== user.id) return forbidden();

    if (user.role !== "ADMIN" && (await isAppointmentLocked(existing.appointmentId ?? null))) {
      return NextResponse.json({ message: "Medical record is locked (appointment completed)" }, { status: 409 });
    }

    await prisma.medicalRecord.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE /api/medical-records/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
