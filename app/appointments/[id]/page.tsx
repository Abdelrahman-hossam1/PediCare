// app/appointments/[id]/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import AppointmentActions from "./appointment-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, User, Stethoscope, FileText, Phone, Mail } from "lucide-react";

type Appointment = {
  id: string;
  startsAt: string;
  status: string;
  notes?: string | null;
  patient: { id: string; firstName: string; lastName: string; phone: string; email?: string | null };
  doctor: { id: string; email: string; role: string };
  medicalRecord?: { id: string } | null;
};

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

async function getAppointment(id: string): Promise<Appointment | null> {
  const token = (await cookies()).get("token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/appointments/${id}`, {
    cache: "no-store",
    headers: token ? { cookie: `token=${token}` } : {},
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function AppointmentPage({ params }: { params: { id: string } }) {
  const { id } = await (params as unknown as Promise<{ id: string }>);
  const a = await getAppointment(id);

  if (!a) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Appointment not found or access denied.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
          <p className="text-sm text-muted-foreground">ID: {a.id}</p>
        </div>
        {getStatusBadge(a.status)}
      </div>

      {/* Main Info Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Patient Section */}
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground font-medium text-lg">
                {getInitials(a.patient.firstName, a.patient.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {a.patient.firstName} {a.patient.lastName}
              </h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {a.patient.phone}
                </div>
                {a.patient.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {a.patient.email}
                  </div>
                )}
              </div>
              <Button variant="link" size="sm" className="px-0 mt-1" asChild>
                <Link href={`/patients/${a.patient.id}`}>View Patient Profile →</Link>
              </Button>
            </div>
          </div>

          <hr className="border-border" />

          {/* Appointment Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="font-medium">
                  {new Date(a.startsAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
                <p className="font-medium">
                  {new Date(a.startsAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Stethoscope className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Doctor</p>
                <p className="font-medium">{a.doctor.email.split("@")[0]}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Medical Record</p>
                {a.medicalRecord ? (
                  <Button variant="link" size="sm" className="px-0 h-auto font-medium" asChild>
                    <Link href={`/medical-records/${a.medicalRecord.id}`}>View Record →</Link>
                  </Button>
                ) : (
                  <Button variant="link" size="sm" className="px-0 h-auto font-medium text-primary" asChild>
                    <Link href={`/medical-records/new?appointmentId=${a.id}`}>+ Create Record</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {a.notes && (
            <>
              <hr className="border-border" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm">{a.notes}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <AppointmentActions id={a.id} currentStatus={a.status} />

      {/* Back Link */}
      <Button variant="outline" asChild>
        <Link href="/appointments">← Back to Appointments</Link>
      </Button>
    </div>
  );
}
