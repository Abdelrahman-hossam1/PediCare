"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice } from "../types";

export function InvoiceDetails({
  invoice,
  loading,
  onRemoveItem,
}: {
  invoice: Invoice;
  loading: boolean;
  onRemoveItem: (itemId: string) => void;
}) {
  return (
    <section className="rounded-lg border p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">Invoice</div>
        <div className="text-xs text-muted-foreground">
          Paid: <span className="font-medium">{invoice.isPaid ? "Yes" : "No"}</span>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit</TableHead>
              <TableHead className="text-right">Line total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items?.length ? (
              invoice.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-medium">{it.name}</TableCell>
                  <TableCell>{it.type}</TableCell>
                  <TableCell className="text-right">{it.quantity}</TableCell>
                  <TableCell className="text-right">{it.price}</TableCell>
                  <TableCell className="text-right">{it.price * it.quantity}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={loading}
                      onClick={() => {
                        if (!confirm("Remove this item from the invoice?")) return;
                        onRemoveItem(it.id);
                      }}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No items yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex flex-col items-end gap-1">
        <div>
          Subtotal: <span className="font-medium">{invoice.subtotal}</span>
        </div>
        <div>
          Total: <span className="font-semibold">{invoice.total}</span>
        </div>
      </div>
    </section>
  );
}

