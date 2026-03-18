"use client";

import { Button } from "@/components/ui/button";
import { InvoiceDetails } from "./invoice-details";
import type { Invoice } from "../types";

export function InvoiceActions({
  invoice,
  loading,
  onCreate,
  onDelete,
  onRemoveItem,
}: {
  invoice: Invoice | null;
  loading: boolean;
  onCreate: () => void;
  onDelete: () => void;
  onRemoveItem: (itemId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Button disabled={loading} onClick={onCreate} variant="outline" className="w-full">
        Create invoice
      </Button>

      {invoice ? <InvoiceDetails invoice={invoice} loading={loading} onRemoveItem={onRemoveItem} /> : null}

      {invoice ? (
        <Button disabled={loading} onClick={onDelete} variant="destructive" className="w-full">
          Delete invoice
        </Button>
      ) : null}
    </div>
  );
}

