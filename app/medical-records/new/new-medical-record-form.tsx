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

type AppointmentOption = {
  id: string;
  startsAt: string;
  status: string;
  patientLabel: string;
};

export default function NewMedicalRecordForm({
  appointments,
  defaultAppointmentId,
}: {
  appointments: AppointmentOption[];
  defaultAppointmentId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const MedicalRecordSchema = z.object({
    appointmentId: z.string().min(1, "Appointment is required"),
    diagnosis: z.string().optional(),
    symptoms: z.string().optional(),
    treatmentPlan: z.string().optional(),
    notes: z.string().optional(),
  });
  type MedicalRecordValues = z.infer<typeof MedicalRecordSchema>;

  const form = useForm<MedicalRecordValues>({
    resolver: zodResolver(MedicalRecordSchema),
    defaultValues: {
      appointmentId: defaultAppointmentId ?? "",
      diagnosis: "",
      symptoms: "",
      treatmentPlan: "",
      notes: "",
    },
  });

  async function onSubmit(values: MedicalRecordValues) {
    setServerError(null);
    const payload = {
      appointmentId: values.appointmentId,
      diagnosis: values.diagnosis || undefined,
      symptoms: values.symptoms || undefined,
      treatmentPlan: values.treatmentPlan || undefined,
      notes: values.notes || undefined,
    };

    try {
      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setServerError(body?.message || "Failed to create medical record");
        return;
      }

      router.push(`/medical-records/${body.id}`);
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

        <FormField
          control={form.control}
          name="appointmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                >
                  <option value="" disabled>
                    Select an appointment
                  </option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {new Date(a.startsAt).toLocaleString()} — {a.patientLabel} ({a.status})
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
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Diagnosis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symptoms (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Symptoms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatmentPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment plan (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Treatment plan" {...field} />
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
          {form.formState.isSubmitting ? "Saving..." : "Create medical record"}
        </Button>
      </form>
    </Form>
  );
}

