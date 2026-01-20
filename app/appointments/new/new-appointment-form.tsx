"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PatientOption = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type DoctorOption = {
  id: string;
  email: string;
};

function toISO(value: string) {
  return new Date(value).toISOString();
}

export default function NewAppointmentForm({
  patients,
  doctors,
  initialPatientId,
  initialDoctorId,
}: {
  patients: PatientOption[];
  doctors: DoctorOption[];
  initialPatientId?: string;
  initialDoctorId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const AppointmentSchema = z.object({
    patientId: z.string().min(1, "Patient is required"),
    doctorId: z.string().min(1, "Doctor is required"),
    startsAt: z.string().min(1, "Start time is required"), // datetime-local
    notes: z.string().optional(),
  });
  type AppointmentValues = z.infer<typeof AppointmentSchema>;

  const form = useForm<AppointmentValues>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      patientId: initialPatientId ?? "",
      doctorId: initialDoctorId ?? "",
      startsAt: "",
      notes: "",
    },
  });

  async function onSubmit(values: AppointmentValues) {
    setServerError(null);

    const payload = {
      patientId: values.patientId,
      doctorId: values.doctorId,
      startsAt: toISO(values.startsAt),
      notes: values.notes || "",
    };

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setServerError(body?.message || "Failed to create appointment");
        return;
      }

      router.push(`/appointments/${body.id}`);
      router.refresh();
    } catch {
      setServerError("Network error");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                  >
                    <option value="" disabled>
                      Select patient
                    </option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} — {p.phone}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                  >
                    <option value="" disabled>
                      Select doctor
                    </option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.email}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="startsAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Create appointment"}
        </Button>
      </form>
    </Form>
  );
}
