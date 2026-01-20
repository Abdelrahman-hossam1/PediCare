
// app/appointments/[id]/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import AppointmentActions from "./appointment-actions";
import { Button } from "@/components/ui/button";

type Appointment = {
  id: string;
  startsAt: string;
  status: string;
  notes?: string | null;
  patient: { id: string; firstName: string; lastName: string; phone: string; email?: string | null };
  doctor: { id: string; email: string; role: string };
   medicalRecord?: { id: string } | null;
};
async function getAppointment(id: string): Promise<Appointment | null> {
  const token = (await cookies()).get("token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/appointments/${id}`, 
    {
      cache: "no-store",
      headers: token ? { cookie: `token=${token}` } : {},
    }
  );

  if (!res.ok) return null;
return res.json();
}

export default async function AppointmentPage({ params }: { params: { id: string } }) {
  const { id } = await (params as unknown as Promise<{ id: string }>);
  const a = await getAppointment(id);
  if (!a)     return <div className="p-6">Appointment not found or not allowed.</div>;
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <div className="">
        <h1 className="text-2xl font-semibold">Appointment</h1>
        <p className="text-sm text-gray-600">{a.id}</p>
        </div>

      </div>

      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <div><b>Patient:</b> {a.patient.firstName} {a.patient.lastName} — {a.patient.phone}</div>
        <div><b>Doctor:</b> {a.doctor.email}</div>
        <div><b>Starts:</b> {new Date(a.startsAt).toLocaleString()}</div>
        <div><b>Status:</b> {a.status}</div>
        <div><b>Notes:</b> {a.notes ?? "-"}</div>
        <div>
          <b>Medical record:</b>{" "}
          {a.medicalRecord ? (
            <Link className="underline" href={`/medical-records/${a.medicalRecord.id}`}>
              View
            </Link>
          ) : (
            <Link className="underline" href={`/medical-records/new?appointmentId=${a.id}`}>
              Fill
            </Link>
          )}
        </div>
      </div>

      <AppointmentActions id={a.id} currentStatus={a.status} />
    </div>
  );
}




