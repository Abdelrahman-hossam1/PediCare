import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

function computeTotal(subtotal: number, discountType: string | null, discountValue: number | null): number {
  if (!discountType || discountValue == null) return subtotal;
  if (discountType === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, discountValue));
    return Math.max(0, subtotal - Math.floor((subtotal * pct) / 100));
  }
  return Math.max(0, subtotal - discountValue);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "RECEPTIONIST"].includes(String(user.role))) return forbidden();

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const item = await tx.invoiceItem.findUnique({ where: { id } });
      if (!item) return null;

      const invoice = await tx.invoice.findUnique({
        where: { id: item.invoiceId },
        select: { id: true, discountType: true, discountValue: true },
      });
      if (!invoice) return null;

      // Restore vaccine stock if needed
      if (item.type === "VACCINE" && item.vaccineId) {
        await tx.vaccine.update({
          where: { id: item.vaccineId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.invoiceItem.delete({ where: { id } });

      const items = await tx.invoiceItem.findMany({
        where: { invoiceId: invoice.id },
        select: { price: true, quantity: true },
      });

      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const total = computeTotal(subtotal, invoice.discountType ?? null, invoice.discountValue ?? null);

      return await tx.invoice.update({
        where: { id: invoice.id },
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
      return NextResponse.json({ message: "Invoice item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/invoice-items/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

