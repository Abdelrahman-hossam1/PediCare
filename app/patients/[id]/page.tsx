// app/patients/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient) {
    return <div className="p-6">Patient not found.</div>;
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    orderBy: { startsAt: "desc" },
    include: {
      doctor: {
        select: { id: true, email: true },
      },
    },
    take: 50,
  });

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-gray-600">
            {patient.phone} • {patient.email ?? "no email"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/medical-records?patientId=${patient.id}`}>Medical records</Link>
          </Button>
          <Button asChild>
            <Link href={`/appointments/new?patientId=${patient.id}`}>New appointment</Link>
          </Button>
        </div>
      </div>

      {/* Patient info */}
      <div className="rounded-lg border p-4 text-sm space-y-2">
        <div><b>Gender:</b> {patient.gender}</div>
        <div>
          <b>Date of birth:</b>{" "}
          {new Date(patient.dateOfBirth).toLocaleDateString()}
        </div>
        <div><b>Blood type:</b> {patient.bloodType ?? "-"}</div>
        <div><b>Allergies:</b> {patient.allergies ?? "-"}</div>
        <div><b>Notes:</b> {patient.notes ?? "-"}</div>
      </div>

      {/* Appointments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Appointments</h2>
          <Link
            className="underline text-sm"
            href={`/appointments?patientId=${patient.id}`}
          >
            View all
          </Link>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.startsAt).toLocaleString()}</TableCell>
                  <TableCell>{a.doctor.email}</TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell>
                    <Link className="underline" href={`/appointments/${a.id}`}>
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              {appointments.length === 0 && (
                <TableRow>
                  <TableCell className="text-gray-500" colSpan={4}>
                    No appointments for this patient yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
