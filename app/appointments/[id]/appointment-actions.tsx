"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InvoiceActions } from "./components/invoice-actions";
import { InvoiceDetails } from "./components/invoice-details";
import { StatusRow } from "./components/status-row";
import { VaccineRow } from "./components/vaccine-row";
import type { Invoice, Vaccine } from "./types";

export default function AppointmentActions({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [vaccineId, setVaccineId] = useState<string>("");

  const selectedVaccine = vaccines.find((v) => v.id === vaccineId) ?? null;
  const price = selectedVaccine?.defaultPrice ?? 0;

  async function loadInvoice() {
    const res = await fetch(`/api/invoices?appointmentId=${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 404) {
      setInvoice(null);
      return;
    }

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      setError(body?.message || "Failed to load invoice");
      return;
    }

    setInvoice(body);
  }

  async function loadVaccines() {
    const res = await fetch("/api/vaccines", { method: "GET" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      setError(body?.message || "Failed to load vaccines");
      return;
    }

    const list = Array.isArray(body) ? (body as Vaccine[]) : [];
    setVaccines(list);

    if (!vaccineId && list.length > 0) {
      setVaccineId(list[0].id);
    }
  }

  useEffect(() => {
    void loadInvoice();
    void loadVaccines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const body = await res.json().catch(() => null);

    setLoading(false);

    if (!res.ok) {
      setError(body?.message || "Failed to update");
      return;
    }

    router.refresh();
  }

  async function deleteAppointment() {
    if (!confirm("Delete this appointment?")) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);

    setLoading(false);

    if (!res.ok) {
      setError(body?.message || "Failed to delete");
      return;
    }

    router.push("/appointments");
    router.refresh();
  }

  async function createInvoice() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id, items: [] }),
    });

    const body = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(body?.message || "Failed to create invoice");
      return null;
    }

    setInvoice(body);
    return body as Invoice;
  }

  async function addVaccineToInvoice({
    invoiceId,
    vaccineId,
    quantity,
  }: {
    invoiceId: string;
    vaccineId: string;
    quantity: number;
  }) {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/invoice-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, vaccineId, quantity }),
    });

    const body = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(body?.message || "Failed to add vaccine");
      return null;
    }

    setInvoice(body);
    return body as Invoice;
  }

  async function deleteInvoice(invoiceId: string) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(body?.message || "Failed to delete invoice");
      return false;
    }

    setInvoice(null);
    return true;
  }

  async function removeInvoiceItem(itemId: string) {
    if (!invoice) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/invoice-items/${itemId}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);

    setLoading(false);

    if (!res.ok) {
      setError(body?.message || "Failed to remove item");
      return;
    }

    setInvoice(body as Invoice);
    await loadVaccines(); // restore stock numbers only
  }

  return (
    <div className="space-y-4">
      <StatusRow
        status={status}
        loading={loading}
        onChangeStatus={setStatus}
        onUpdate={updateStatus}
      />

      <VaccineRow
        vaccines={vaccines}
        vaccineId={vaccineId}
        price={price}
        loading={loading}
        canAdd={Boolean(invoice)}
        onChangeVaccine={(nextId) => setVaccineId(nextId)}
        onAdd={async () => {
          if (!invoice) {
            setError("Create an invoice first.");
            return;
          }
          if (!vaccineId) {
            setError("Select a vaccine first.");
            return;
          }
          setError(null);
          await addVaccineToInvoice({ invoiceId: invoice.id, vaccineId, quantity: 1 });
          await loadVaccines(); // refresh stock only
        }}
      />

      <InvoiceActions
        hasInvoice={Boolean(invoice)}
        loading={loading}
        onCreate={async () => {
          setError(null);
          const created = await createInvoice();
          if (created) router.refresh();
        }}
        onDelete={async () => {
          if (!invoice) return;
          if (!confirm("Delete this invoice? This will also delete its payments and restore vaccine stock.")) return;
          setError(null);
          const ok = await deleteInvoice(invoice.id);
          if (ok) await loadVaccines(); // refresh stock only
        }}
      />

      {invoice ? (
        <InvoiceDetails invoice={invoice} loading={loading} onRemoveItem={removeInvoiceItem} />
      ) : null}

      <Button
        disabled={loading}
        onClick={deleteAppointment}
        variant="outline"
      >
        Delete Appointment
      </Button>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
