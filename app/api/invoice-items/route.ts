import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

const CreateInvoiceItemSchema = z.object({
  invoiceId: z.string().cuid(),
  vaccineId: z.string().cuid(),
  quantity: z.coerce.number().int().positive().default(1),
});

function computeTotal(
  subtotal: number,
  discountType: string | null,
  discountValue: number | null
): number {
  if (!discountType || discountValue == null) return subtotal;
  if (discountType === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, discountValue));
    return Math.max(0, subtotal - Math.floor((subtotal * pct) / 100));
  }
  // FIXED
  return Math.max(0, subtotal - discountValue);
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "RECEPTIONIST"].includes(String(user.role))) return forbidden();

    const body = await req.json().catch(() => null);
    const parsed = CreateInvoiceItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { invoiceId, vaccineId, quantity } = parsed.data;

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { items: true },
      });
      if (!invoice) {
        return null;
      }

      const vaccine = await tx.vaccine.findUnique({ where: { id: vaccineId } });
      if (!vaccine) {
        throw new Error("Vaccine not found");
      }

      if (vaccine.stock < quantity) {
        throw new Error("Insufficient stock");
      }

      await tx.vaccine.update({
        where: { id: vaccineId },
        data: { stock: { decrement: quantity } },
      });

      // If the same vaccine item already exists on this invoice, increment its quantity
      const existing = await tx.invoiceItem.findFirst({
        where: {
          invoiceId,
          type: "VACCINE",
          vaccineId,
        },
      });

      if (existing) {
        await tx.invoiceItem.update({
          where: { id: existing.id },
          data: { quantity: { increment: quantity } },
        });
      } else {
        await tx.invoiceItem.create({
          data: {
            invoiceId,
            vaccineId,
            name: vaccine.name,
            type: "VACCINE",
            // price is taken from DB at the time the item is first added
            price: vaccine.defaultPrice,
            quantity,
          },
        });
      }

      const items = await tx.invoiceItem.findMany({
        where: { invoiceId },
        select: { price: true, quantity: true },
      });

      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const total = computeTotal(subtotal, invoice.discountType ?? null, invoice.discountValue ?? null);

      return await tx.invoice.update({
        where: { id: invoiceId },
        data: { subtotal, total },
        include: {
          items: { orderBy: { createdAt: "asc" } },
          payments: true,
          appointment: {
            include: {
              patient: true,
              doctor: true,
            },
          },
        },
      });
    });

    if (!updatedInvoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(updatedInvoice, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/invoice-items error:", error);
    if (error?.message === "Vaccine not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error?.message === "Insufficient stock") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

