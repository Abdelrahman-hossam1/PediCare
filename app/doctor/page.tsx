import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Clock, Users, CheckCircle2, Play } from "lucide-react";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SCHEDULED":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Scheduled</Badge>;
    case "CONFIRMED":
      return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Checked In</Badge>;
    case "COMPLETED":
      return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Completed</Badge>;
    case "CANCELED":
      return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Canceled</Badge>;
    case "NO_SHOW":
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">No Show</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function DoctorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "DOCTOR" && user.role !== "ADMIN") {
    return <div className="p-6">Forbidden.</div>;
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const whereClause = user.role === "DOCTOR"
    ? { doctorId: user.id, startsAt: { gte: start, lt: end } }
    : { startsAt: { gte: start, lt: end } };

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    orderBy: { startsAt: "asc" },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      medicalRecord: { select: { id: true } },
    },
  });

  // Calculate stats
  const totalToday = appointments.length;
  const waiting = appointments.filter(a => a.status === "SCHEDULED" || a.status === "CONFIRMED").length;
  const completed = appointments.filter(a => a.status === "COMPLETED").length;

  const stats = [
    {
      label: "Today's Appointments",
      value: totalToday,
      icon: CalendarDays,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Waiting Patients",
      value: waiting,
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    },
    {
      label: "Completed Today",
      value: completed,
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
  ];

  // Get appointments that are not completed for the queue
  const queue = appointments.filter(a => a.status !== "COMPLETED" && a.status !== "CANCELED");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Your appointments and patient queue for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Patient Queue */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Patient Queue</h2>
        <div className="space-y-3">
          {queue.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 bg-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {getInitials(appointment.patient.firstName, appointment.patient.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.notes || "General Checkup"}
                      </p>
                    </div>
                  </div>
                  {/*access to appointment info*/}
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/appointments/${appointment.id}`}>
                        View Appointment
                      </Link>
                    </Button>
                  </div>
                  {/* Time & Status */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {new Date(appointment.startsAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.startsAt).toLocaleDateString("en-CA")}
                      </p>
                    </div>

                    {getStatusBadge(appointment.status)}

                    {appointment.status === "CONFIRMED" ? (
                      <Button size="sm" className="gap-2">
                        <Play className="h-4 w-4" />
                        Start Consultation
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        Waiting
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {queue.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No patients in queue for today.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/appointments">View All Appointments</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/medical-records">Medical Records</Link>
        </Button>
      </div>
    </div>
  );
}
