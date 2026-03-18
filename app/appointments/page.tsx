import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/getCurrentUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteAppointmentButton } from "./delete-appointment-button";
import { CalendarPlus, Search, Filter } from "lucide-react";


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

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SCHEDULED":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
    case "CONFIRMED":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
    case "COMPLETED":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
    case "CANCELED":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Canceled</Badge>;
    case "NO_SHOW":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">No Show</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">In Progress</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

async function getAppointments(queryString: string): Promise<Appointment[]> {
  const token = (await cookies()).get("token")?.value;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

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
  const user = await getCurrentUser();
  const canDelete =
    !!user && ["ADMIN", "RECEPTIONIST"].includes(String(user.role));

  const qs = new URLSearchParams();
  if (sp.doctorId) qs.set("doctorId", sp.doctorId);
  if (sp.status) qs.set("status", sp.status);
  if (sp.date) qs.set("date", sp.date);

  const queryString = qs.toString() ? `?${qs.toString()}` : "";

  const appointments = await getAppointments(queryString);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        <Button asChild>
          <Link href="/appointments/new">
            <CalendarPlus className="h-4 w-4 mr-2" />
            New Appointment
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form className="flex flex-wrap gap-3 items-end">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                name="doctorId"
                placeholder="Doctor ID (optional)"
                defaultValue={sp.doctorId || ""}
                className="h-9"
              />
            </div>
            <div className="w-[180px]">
              <select
                name="status"
                defaultValue={sp.status || ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
            <div className="w-[180px]">
              <Input
                name="date"
                type="date"
                defaultValue={sp.date || ""}
                className="h-9"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Apply Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Patient</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {getInitials(appointment.patient.firstName, appointment.patient.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/patients/${appointment.patient.id}`}
                        className="font-medium hover:underline"
                      >
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </Link>
                      <p className="text-sm text-muted-foreground">{appointment.patient.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {new Date(appointment.startsAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.startsAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {appointment.doctor.email?.split("@")[0] || "—"}
                </TableCell>
                <TableCell>
                  {getStatusBadge(appointment.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/appointments/${appointment.id}`}>
                        View
                      </Link>
                    </Button>
                    {canDelete && (
                      <DeleteAppointmentButton appointmentId={appointment.id} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No appointments found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}