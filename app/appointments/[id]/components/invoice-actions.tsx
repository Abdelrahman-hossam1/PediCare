"use client";

import { Button } from "@/components/ui/button";

export function InvoiceActions({
  hasInvoice,
  loading,
  onCreate,
  onDelete,
}: {
  hasInvoice: boolean;
  loading: boolean;
  onCreate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Button disabled={loading} onClick={onCreate} variant="outline" className="w-full">
        Create invoice
      </Button>
      {hasInvoice ? (
        <Button disabled={loading} onClick={onDelete} variant="destructive" className="w-full">
          Delete invoice
        </Button>
      ) : null}
    </div>
  );
}

