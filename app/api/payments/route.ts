import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "RECEPTIONIST", "DOCTOR"].includes(String(user.role))) return forbidden();

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");

    if (invoiceId) {
      const payments = await prisma.payment.findMany({
        where: { invoiceId },
        include: {
          handledBy: {
            select: { id: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(payments);
    }

    const payments = await prisma.payment.findMany({
      include: {
        handledBy: {
          select: { id: true, email: true, role: true },
        },
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "RECEPTIONIST"].includes(String(user.role))) return forbidden();

    const body = await req.json();
    const { invoiceId, amount, method, handledById } = body;

    if (!invoiceId || !amount || !method || !handledById) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Create payment and update invoice in a transaction
    const payment = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method,
          handledById,
        },
      });

      // Update invoice isPaid if total reached
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= invoice.total) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { isPaid: true },
        });
      }

      return payment;
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/payments error:", error);
    if (error.message === "Invoice not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
