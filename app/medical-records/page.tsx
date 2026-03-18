import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canRead } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Pencil, Search } from "lucide-react";

type SearchParams = {
  patientId?: string;
  doctorId?: string;
  q?: string;
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

export default async function MedicalRecordsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user || !canRead(user.role)) redirect("/login");

  const sp = await searchParams;

  const where: Record<string, unknown> = {};
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">View and manage patient medical records</p>
        </div>
        {user.role === "DOCTOR" && (
          <Button asChild>
            <Link href="/medical-records/new">New Record</Link>
          </Button>
        )}
      </div>

      {/* Stats & Search */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">
          All Medical Records ({records.length})
        </p>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by patient, diagnosis..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {records.map((record: any) => (
          <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 bg-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {getInitials(record.patient.firstName, record.patient.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">
                        {record.patient.firstName} {record.patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString("en-CA")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {record.doctor.email?.split("@")[0] || "Doctor"}
                  </Badge>
                </div>

                {/* Content Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Chief Complaint
                    </p>
                    <p className="mt-1 font-medium">
                      {record.chiefComplaint || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Diagnosis
                    </p>
                    <p className="mt-1 font-medium">
                      {record.diagnosis || "Pending"}
                    </p>
                  </div>
                </div>

                {/* Treatment */}
                {record.treatment && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Treatment
                    </p>
                    <p className="mt-1">{record.treatment}</p>
                  </div>
                )}

                {/* Prescriptions */}
                {record.prescriptions && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Prescriptions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {String(record.prescriptions).split(",").map((rx: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {rx.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Notes */}
                {record.notes && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Clinical Notes
                    </p>
                    <p className="text-sm">{record.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/medical-records/${record.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Record
                    </Link>
                  </Button>
                  {user.role === "DOCTOR" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/medical-records/${record.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {records.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No medical records found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
