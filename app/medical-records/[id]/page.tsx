import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canRead } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/getCurrentUser";
import MedicalRecordActions from "./medical-record-actions";
import { Button } from "@/components/ui/button";

export default async function MedicalRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !canRead(user.role)) redirect("/login");

  const { id } = await params;

  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      doctor: { select: { id: true, email: true, role: true } },
      appointment: { select: { id: true, startsAt: true, status: true } },
    },
  });

  if (!record) return <div className="p-6">Medical record not found.</div>;

  const canEdit =
    user.role === "ADMIN" || (user.role === "DOCTOR" && record.doctorId === user.id);
  const locked = record.appointment?.status === "COMPLETED";

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Medical record</h1>
          <p className="text-sm text-gray-600">{record.id}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/medical-records">Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/patients/${record.patientId}`}>Patient</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <div>
          <b>Patient:</b> {record.patient.firstName} {record.patient.lastName} — {record.patient.phone}
        </div>
        <div>
          <b>Doctor:</b> {record.doctor.email}
        </div>
        <div>
          <b>Appointment:</b>{" "}
          {record.appointment ? (
            <>
              {new Date(record.appointment.startsAt).toLocaleString()} ({record.appointment.status})
            </>
          ) : (
            "-"
          )}
        </div>
        <div>
          <b>Diagnosis:</b> {record.diagnosis ?? "-"}
        </div>
        <div>
          <b>Symptoms:</b> {record.symptoms ?? "-"}
        </div>
        <div>
          <b>Treatment plan:</b> {record.treatmentPlan ?? "-"}
        </div>
        <div>
          <b>Notes:</b> {record.notes ?? "-"}
        </div>
      </div>

      <MedicalRecordActions
        id={record.id}
        canEdit={canEdit}
        locked={locked}
        initial={{
          diagnosis: record.diagnosis,
          symptoms: record.symptoms,
          treatmentPlan: record.treatmentPlan,
          notes: record.notes,
        }}
      />
    </div>
  );
}

