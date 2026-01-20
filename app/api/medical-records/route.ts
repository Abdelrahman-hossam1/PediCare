import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

const CreateMedicalRecordSchema = z.object({
  // Create is tied to an appointment (one record per appointment)
  appointmentId: z.string().cuid(),
  diagnosis: z.string().optional(),
  symptoms: z.string().optional(),
  treatmentPlan: z.string().optional(),
  notes: z.string().optional(),
});

const canReadMedical = (role: string) => ["ADMIN", "DOCTOR", "RECEPTIONIST"].includes(role);
// Admin can do everything; doctor can create for their own appointments
const canCreateMedical = (role: string) => ["ADMIN", "DOCTOR"].includes(role);

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canReadMedical(user.role)) return forbidden();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;

    // Optional: doctors see only their own records
    if (user.role === "DOCTOR") where.doctorId = user.id;

    const records = await prisma.medicalRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        doctor: { select: { id: true, email: true } },
        appointment: { select: { id: true, startsAt: true, status: true } },
      },
      take: 100,
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/medical-records error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canCreateMedical(user.role)) return forbidden();

    const body = await req.json();
    const parsed = CreateMedicalRecordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Confirm appointment exists and belongs to this doctor
    const appt = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      select: { id: true, patientId: true, doctorId: true, status: true, startsAt: true },
    });
    if (!appt) return NextResponse.json({ message: "Appointment not found" }, { status: 404 });

    // Doctor can only create for their own appointment; admin can create for any
    if (user.role === "DOCTOR" && appt.doctorId !== user.id) return forbidden();

    // Optional: prevent writing record for canceled appointment
    if (appt.status === "CANCELED") {
      return NextResponse.json({ message: "Cannot create record for canceled appointment" }, { status: 400 });
    }

    // Confirm medical record not already created for this appointment
    const existing = await prisma.medicalRecord.findUnique({
      where: { appointmentId: data.appointmentId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ message: "Medical record already exists for this appointment" }, { status: 409 });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: appt.patientId,
        // Always tie record to the appointment's doctor (admin may be creating it)
        doctorId: appt.doctorId,
        appointmentId: appt.id,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        treatmentPlan: data.treatmentPlan,
        notes: data.notes,
      },
      include: {
        doctor: { select: { id: true, email: true } },
        appointment: { select: { id: true, startsAt: true, status: true } },
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("POST /api/medical-records error:", error);
    // Unique constraint on appointmentId (one record per appointment)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
