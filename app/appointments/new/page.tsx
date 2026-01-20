// app/appointments/new/page.tsx
import { prisma } from "@/lib/prisma";
import NewAppointmentForm from "./new-appointment-form";
import Link from "next/link";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; doctorId?: string }>;
}) {
  const sp = await searchParams;
  const patients = await prisma.patient.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, firstName: true, lastName: true, phone: true },
    take: 200,
  });

  const doctors = await prisma.user.findMany({
    where: { isActive: true, role: "DOCTOR" },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true },
    take: 200,
  });

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New appointment</h1>
      <div className="flex items-center justify-between gap-3">
        {!sp.patientId && (
          <Link
            href="/patients/new?returnTo=/appointments/new"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            New patient
          </Link>
        )}
      </div>
      <NewAppointmentForm
        patients={patients}
        doctors={doctors}
        initialPatientId={sp.patientId}
        initialDoctorId={sp.doctorId}
      />
    </div>
  );
}
