"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Vaccine } from "../types";

export function VaccineRow({
  vaccines,
  vaccineId,
  price,
  loading,
  canAdd,
  onChangeVaccine,
  onAdd,
}: {
  vaccines: Vaccine[];
  vaccineId: string;
  price: number;
  loading: boolean;
  canAdd: boolean;
  onChangeVaccine: (nextId: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-[240px] flex-1 flex-col gap-1">
        <Label>Vaccine</Label>
        <select
          value={vaccineId}
          onChange={(e) => onChangeVaccine(e.target.value)}
          className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
        >
          {vaccines.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} (Stock: {v.stock})
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-36 flex-col gap-1">
        <Label>Price (from DB)</Label>
        <Input type="number" value={String(price)} disabled />
      </div>

      <Button disabled={loading || !canAdd} onClick={onAdd} variant="secondary">
        Add Vaccine
      </Button>
    </div>
  );
}

