import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import NewMedicalRecordForm from "./new-medical-record-form";

type SearchParams = {
  appointmentId?: string;
};

export default async function NewMedicalRecordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "DOCTOR") {
    return <div className="p-6">Forbidden: only doctors can create medical records.</div>;
  }

  const sp = await searchParams;

  // Show only appointments for this doctor that don't already have a record
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: user.id,
      status: { not: "CANCELED" },
      medicalRecord: { is: null },
    },
    orderBy: { startsAt: "desc" },
    take: 200,
    include: {
      patient: { select: { firstName: true, lastName: true, phone: true } },
    },
  });

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New medical record</h1>

      {appointments.length === 0 ? (
        <p className="text-sm text-gray-600">
          No eligible appointments found (must be your appointment, not canceled, and without an existing record).
        </p>
      ) : (
        <NewMedicalRecordForm
          defaultAppointmentId={sp.appointmentId}
          appointments={appointments.map((a: any) => ({
            id: a.id,
            startsAt: a.startsAt.toISOString?.() ? a.startsAt.toISOString() : String(a.startsAt),
            status: a.status,
            patientLabel: `${a.patient.firstName} ${a.patient.lastName} — ${a.patient.phone}`,
          }))}
        />
      )}
    </div>
  );
}

