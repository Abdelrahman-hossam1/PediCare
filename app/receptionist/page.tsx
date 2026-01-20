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

export default async function ReceptionistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!["ADMIN", "RECEPTIONIST"].includes(user.role)) {
    return <div className="p-6">Forbidden.</div>;
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const today = await prisma.appointment.findMany({
    where: { startsAt: { gte: start, lt: end } },
    orderBy: { startsAt: "asc" },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      doctor: { select: { id: true, email: true } },
      medicalRecord: { select: { id: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="rounded-md bg-primary px-4 py-2 text-2xl font-semibold text-primary-foreground">
          Receptionist
        </h1>
        <Link href="/appointments/new" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          Create appointment
        </Link>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-primary text-primary-foreground">
            <TableRow className="hover:bg-primary">
              <TableHead className="text-primary-foreground">Time</TableHead>
              <TableHead className="text-primary-foreground">Patient</TableHead>
              <TableHead className="text-primary-foreground">Doctor</TableHead>
              <TableHead className="text-primary-foreground">Status</TableHead>
              <TableHead className="text-primary-foreground">Record</TableHead>
              <TableHead className="text-primary-foreground">Open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {today.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{new Date(a.startsAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div>
                    {a.patient.firstName} {a.patient.lastName}
                  </div>
                  <div className="text-gray-500">{a.patient.phone}</div>
                </TableCell>
                <TableCell>{a.doctor.email}</TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell>{a.medicalRecord ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Link className="underline" href={`/appointments/${a.id}`}>
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {today.length === 0 && (
              <TableRow>
                <TableCell className="text-gray-500" colSpan={6}>
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

