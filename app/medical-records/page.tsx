import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canRead } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SearchParams = {
  patientId?: string;
  doctorId?: string;
};

export default async function MedicalRecordsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user || !canRead(user.role)) redirect("/login");

  const sp = await searchParams;

  const where: any = {};
  if (sp.patientId) where.patientId = sp.patientId;
  if (sp.doctorId) where.doctorId = sp.doctorId;
  if (user.role === "DOCTOR") where.doctorId = user.id;

  const records = await prisma.medicalRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      doctor: { select: { id: true, email: true } },
      appointment: { select: { id: true, startsAt: true, status: true } },
    },
    take: 100,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="rounded-md bg-primary px-4 py-2 text-2xl font-semibold text-primary-foreground">
          Medical records
        </h1>

        {user.role === "DOCTOR" && (
          <Link href="/medical-records/new" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
            New record
          </Link>
        )}
      </div>

      <form className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          name="patientId"
          placeholder="patientId (optional)"
          defaultValue={sp.patientId || ""}
        />
        <Input
          name="doctorId"
          placeholder="doctorId (optional)"
          defaultValue={sp.doctorId || ""}
          disabled={user.role === "DOCTOR"}
        />
        <Button type="submit" variant="outline">
          Apply filters
        </Button>
      </form>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-primary text-primary-foreground">
            <TableRow className="hover:bg-primary">
              <TableHead className="text-primary-foreground">Created</TableHead>
              <TableHead className="text-primary-foreground">Patient</TableHead>
              <TableHead className="text-primary-foreground">Doctor</TableHead>
              <TableHead className="text-primary-foreground">Appointment</TableHead>
              <TableHead className="text-primary-foreground">Open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div>
                    {r.patient.firstName} {r.patient.lastName}
                  </div>
                  <div className="text-gray-500">{r.patient.phone}</div>
                </TableCell>
                <TableCell>{r.doctor.email}</TableCell>
                <TableCell>
                  {r.appointment ? (
                    <div>
                      <div>{new Date(r.appointment.startsAt).toLocaleString()}</div>
                      <div className="text-gray-500">{r.appointment.status}</div>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Link className="underline" href={`/medical-records/${r.id}`}>
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}

            {records.length === 0 && (
              <TableRow>
                <TableCell className="text-gray-500" colSpan={5}>
                  No medical records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

