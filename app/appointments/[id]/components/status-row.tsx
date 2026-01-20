"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const statuses = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"] as const;

export function StatusRow({
  status,
  loading,
  onChangeStatus,
  onUpdate,
}: {
  status: string;
  loading: boolean;
  onChangeStatus: (next: string) => void;
  onUpdate: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-[220px] flex-1 flex-col gap-1">
        <Label>Status</Label>
        <select
          value={status}
          onChange={(e) => onChangeStatus(e.target.value)}
          className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Button disabled={loading} onClick={onUpdate} className="shrink-0">
        {loading ? "Saving..." : "Update status"}
      </Button>
    </div>
  );
}

