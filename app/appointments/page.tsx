import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
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


type Appointment = {
    id: string;
    startsAt: Date;
    status: string;
    notes?: string;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        email?: string | null;
    };
    doctor: {
        id: string;
        email?: string;
        role: string;
    };
    medicalRecord?: { id: string } | null;
}
async function getAppointments(queryString: string): Promise<Appointment[]> {
  const token = (await cookies()).get("token")?.value;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/appointments${queryString}`, {
    cache: "default",
    headers: token ? { cookie: `token=${token}` } : {},
  });

  if (!res.ok) {
    return [];
  }
  return (await res.json()) as Appointment[];
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ doctorId?: string; status?: string; date?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.doctorId) qs.set("doctorId", sp.doctorId);
  if (sp.status) qs.set("status", sp.status);
  if (sp.date) qs.set("date", sp.date);

  const queryString = qs.toString() ? `?${qs.toString()}` : "";

  const appointments = await getAppointments(queryString);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="rounded-md bg-primary px-4 py-2 text-2xl font-semibold text-primary-foreground">
          Appointments
        </h1>

        <Link href="/appointments/new" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          New appointment
        </Link>
      </div>

      {/* Simple filters */}
      <form className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          name="doctorId"
          placeholder="doctorId (optional)"
          defaultValue={sp.doctorId || ""}
        />
        <select
          name="status"
          defaultValue={sp.status || ""}
          className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
        >
          <option value="">All statuses</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELED">CANCELED</option>
          <option value="NO_SHOW">NO_SHOW</option>
        </select>
        <Input name="date" type="date" defaultValue={sp.date || ""} />

        <Button type="submit" variant="outline" className="md:col-span-4">
          Apply filters
        </Button>
      </form>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-primary text-primary-foreground">
            <TableRow className="hover:bg-primary">
              <TableHead className="text-primary-foreground">Time</TableHead>
              <TableHead className="text-primary-foreground">Patient</TableHead>
              <TableHead className="text-primary-foreground">Doctor</TableHead>
              <TableHead className="text-primary-foreground">Status</TableHead>
              <TableHead className="text-primary-foreground">Open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <div>{new Date(a.startsAt).toLocaleString()}</div>
                </TableCell>
                <TableCell>
                  <Link href={`/patients/${a.patient.id}`} className="underline">
                    {a.patient.firstName} {a.patient.lastName}
                  </Link>
                  <div className="text-gray-500">{a.patient.phone}</div>
                </TableCell>
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
                <TableCell className="text-gray-500" colSpan={5}>
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}