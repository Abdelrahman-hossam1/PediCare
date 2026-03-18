"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";

export default function MedicalRecordActions({
  id,
  initial,
  canEdit,
  locked,
}: {
  id: string;
  initial: {
    diagnosis?: string | null;
    symptoms?: string | null;
    treatmentPlan?: string | null;
    notes?: string | null;
  };
  canEdit: boolean;
  locked: boolean;
}) {
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState(initial.diagnosis ?? "");
  const [symptoms, setSymptoms] = useState(initial.symptoms ?? "");
  const [treatmentPlan, setTreatmentPlan] = useState(initial.treatmentPlan ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");

  async function save() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/medical-records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosis, symptoms, treatmentPlan, notes }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.message || "Failed to update");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function del() {
    const ok = await confirmDialog({
      title: "Delete medical record?",
      description: "This will permanently delete the medical record.",
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmVariant: "destructive",
    });
    if (!ok) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/medical-records/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.message || "Failed to delete");
        return;
      }
      router.push("/medical-records");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!canEdit) return null;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="text-sm font-semibold">Edit</div>

      {locked && (
        <p className="text-sm text-muted-foreground">
          This record is locked because the appointment is COMPLETED.
        </p>
      )}

      <Input
        disabled={locked || loading}
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
        placeholder="Diagnosis"
      />
      <Textarea
        disabled={locked || loading}
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        placeholder="Symptoms"
      />
      <Textarea
        disabled={locked || loading}
        value={treatmentPlan}
        onChange={(e) => setTreatmentPlan(e.target.value)}
        placeholder="Treatment plan"
      />
      <Textarea
        disabled={locked || loading}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
      />

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex gap-3">
        <Button
          disabled={locked || loading}
          onClick={save}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button
          disabled={locked || loading}
          onClick={del}
          variant="outline"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

