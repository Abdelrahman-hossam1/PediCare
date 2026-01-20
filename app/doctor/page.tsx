import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DoctorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "DOCTOR") {
    return <div className="p-6">Forbidden.</div>;
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const mine = await prisma.appointment.findMany({
    where: { doctorId: user.id, startsAt: { gte: start, lt: end } },
    orderBy: { startsAt: "asc" },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      medicalRecord: { select: { id: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="inline-block rounded-md bg-primary px-4 py-2 text-2xl font-semibold text-primary-foreground">
        My appointments today
      </h1>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-primary text-primary-foreground">
            <TableRow className="hover:bg-primary">
              <TableHead className="text-primary-foreground">Time</TableHead>
              <TableHead className="text-primary-foreground">Patient</TableHead>
              <TableHead className="text-primary-foreground">Status</TableHead>
              <TableHead className="text-primary-foreground">Medical record</TableHead>
              <TableHead className="text-primary-foreground">Open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mine.map((a: any) => (
              <TableRow key={a.id}>
                <TableCell>{new Date(a.startsAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div>
                    {a.patient.firstName} {a.patient.lastName}
                  </div>
                  <div className="text-gray-500">{a.patient.phone}</div>
                </TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell>
                  {a.medicalRecord ? (
                    <Link className="underline" href={`/medical-records/${a.medicalRecord.id}`}>
                      View
                    </Link>
                  ) : (
                    <Link className="underline" href={`/medical-records/new?appointmentId=${a.id}`}>
                      Fill
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <Link className="underline" href={`/appointments/${a.id}`}>
                    Appointment
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {mine.length === 0 && (
              <TableRow>
                <TableCell className="text-gray-500" colSpan={5}>
                  No appointments today.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

