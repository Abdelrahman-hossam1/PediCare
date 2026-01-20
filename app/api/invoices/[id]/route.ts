import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "RECEPTIONIST"].includes(String(user.role))) return forbidden();

    const deleted = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id },
        include: { items: true, payments: true },
      });
      if (!invoice) return null;

      // Restore vaccine stock for vaccine items
      for (const item of invoice.items) {
        if (item.type === "VACCINE" && item.vaccineId) {
          await tx.vaccine.update({
            where: { id: item.vaccineId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Must delete children first (no cascade specified in schema)
      await tx.payment.deleteMany({ where: { invoiceId: id } });
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await tx.invoice.delete({ where: { id } });

      return invoice;
    });

    if (!deleted) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Invoice deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/invoices/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

