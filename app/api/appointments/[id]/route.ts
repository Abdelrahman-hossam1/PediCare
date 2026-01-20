import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canRead } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

const APPOINTMENT_DURATION_MINUTES = 30;
const canManageAppointments = (role: string | null) => ["ADMIN", "RECEPTIONIST"].includes(String(role));
// Keep backward-compatible statuses based on the Prisma enum in `schema.prisma`.
const allowedStatuses = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"] as const;

const AppointmentUpdateSchema = z.object({
  status: z.enum(allowedStatuses),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!canRead(user.role)) return unauthorized();

    const appointment = await prisma.appointment.findUnique({
      where: { id },
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
          select: {
            id: true,
            diagnosis: true,
            symptoms: true,
            treatmentPlan: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    // Doctors can only view their own appointments
    if (user.role === "DOCTOR" && appointment.doctorId !== user.id) return forbidden();

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("GET /api/appointments/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

async function checkDoubleBooking(doctorId: string, startsAt: Date, excludeId?: string) {
  const endsAt = addMinutes(startsAt, APPOINTMENT_DURATION_MINUTES);
  const startsAtMin = addMinutes(startsAt, -APPOINTMENT_DURATION_MINUTES);
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { not: "CANCELED" },
      id: excludeId ? { not: excludeId } : undefined,
      startsAt: {
        lt: endsAt,
        gt: startsAtMin,
        },
    },
  });

  return conflictingAppointment;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();

    // Receptionist/Admin can update; Doctor can update only their own appointment status
    const canUpdate =
      canManageAppointments(user.role) || (user.role === "DOCTOR" /* own check below */);
    if (!canUpdate) return forbidden();

    const body = await req.json();
    const parsed = AppointmentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: { medicalRecord: { select: { id: true } } },
    });

    if (!existingAppointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }
    if (user.role === "DOCTOR" && existingAppointment.doctorId !== user.id) return forbidden();

    const nextStatus = parsed.data.status;
    const currentStatus = existingAppointment.status;

    const allowedNextByCurrent: Record<string, Set<(typeof allowedStatuses)[number]>> = {
      // Receptionist flow: schedule -> confirmed -> completed (or canceled/no_show)
      SCHEDULED: new Set(["CONFIRMED", "CANCELED"]),
      CONFIRMED: new Set(["COMPLETED", "NO_SHOW", "CANCELED"]),
      COMPLETED: new Set([]),
      CANCELED: new Set([]),
      NO_SHOW: new Set([]),
    };

    // Admin can override transitions; everyone else must follow the workflow
    if (user.role !== "ADMIN" && !allowedNextByCurrent[currentStatus]?.has(nextStatus)) {
        return NextResponse.json(
        { message: `Invalid status transition: ${currentStatus} -> ${nextStatus}` },
          { status: 400 }
        );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: nextStatus },
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

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("PATCH /api/appointments/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();

    // Keep delete restricted to receptionist/admin (not required by spec, but safe)
    if (!canManageAppointments(user.role)) return forbidden();

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/appointments/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}