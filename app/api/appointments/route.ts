import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canRead } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

const APPOINTMENT_DURATION_MINUTES = 30;
const canManageAppointments = (role: string | null) => ["ADMIN", "RECEPTIONIST"].includes(String(role));

const AppointmentCreateSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  // required in Prisma schema; default keeps backward compatibility with older clients
  type: z.string().min(1).default("Consultation"),
  startsAt: z.string().datetime(),
  notes: z.string().optional(),
});

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

async function checkDoubleBooking(doctorId: string, startsAt: Date) {
  // With a fixed duration, two appointments overlap if:
  // existingStart < newEnd AND existingStart > newStart - duration
  const endsAt = addMinutes(startsAt, APPOINTMENT_DURATION_MINUTES);
  const startsAtMin = addMinutes(startsAt, -APPOINTMENT_DURATION_MINUTES);

  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { not: "CANCELED" },
      startsAt: {
        lt: endsAt,
        gt: startsAtMin,
        },
    },
  });

  return conflictingAppointment;
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canRead(user.role)) return unauthorized();

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const where: any = {};

    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;

    // Date filter (optional). If not provided, return all matching appointments.
    if (date) {
      const day = new Date(date);
      const startDate = new Date(day);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.startsAt = { gte: startDate, lt: endDate };
    }

    if (user.role === "DOCTOR") where.doctorId = user.id;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        medicalRecord: {
          select: { id: true },
        },
      },
      orderBy: { startsAt: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();

    // Receptionist/Admin create appointments
    if (!canManageAppointments(user.role)) return forbidden();

    const body = await req.json();
    const parsed = AppointmentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const startsAt = new Date(data.startsAt);

    const conflict = await checkDoubleBooking(data.doctorId, startsAt);
    if (conflict) {
      return NextResponse.json(
        { message: "Doctor is already booked during this time" },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: data.doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        type: data.type,
        startsAt,
        notes: data.notes,
        status: "SCHEDULED",
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        medicalRecord: { select: { id: true } },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}