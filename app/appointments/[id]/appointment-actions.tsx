"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceActions } from "./components/invoice-actions";
import { StatusRow } from "./components/status-row";
import { VaccineRow } from "./components/vaccine-row";
import type { Invoice, Vaccine } from "./types";
import { DeleteAppointmentButton } from "../delete-appointment-button";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";

export default function AppointmentActions({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
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

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

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

    // Update server-rendered badge/header without full page reload
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
        invoice={invoice}
        loading={loading}
        onCreate={async () => {
          setError(null);
          const created = await createInvoice();
          // invoice-actions will re-render based on local state;
          // parent page can be refreshed if needed elsewhere.
        }}
        onDelete={async () => {
          if (!invoice) return;
          const ok = await confirmDialog({
            title: "Delete invoice?",
            description: "This will also delete its payments and restore vaccine stock.",
            confirmText: "Delete",
            cancelText: "Cancel",
            confirmVariant: "destructive",
          });
          if (!ok) return;
          setError(null);
          const deleted = await deleteInvoice(invoice.id);
          if (deleted) await loadVaccines(); // refresh stock only
        }}
        onRemoveItem={removeInvoiceItem}
      />

      <DeleteAppointmentButton
        appointmentId={id}
        redirectTo="/appointments"
        disabled={loading}
        onError={(message) => setError(message)}
      />

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
