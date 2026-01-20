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
    const appointmentId = searchParams.get("appointmentId");

    if (appointmentId) {
      const invoice = await prisma.invoice.findUnique({
        where: { appointmentId },
        include: {
          items: true,
          payments: true,
          appointment: {
            include: {
              patient: true,
              doctor: true,
            },
          },
        },
      });
      if (!invoice) return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
      return NextResponse.json(invoice);
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        items: true,
        payments: true,
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (!["ADMIN", "RECEPTIONIST"].includes(String(user.role))) return forbidden();

    const body = await req.json();
    const { appointmentId, items, discountType, discountValue } = body;

    if (!appointmentId || !items || !Array.isArray(items)) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { appointmentId },
    });
    if (existingInvoice) {
      return NextResponse.json({ message: "Invoice already exists for this appointment" }, { status: 409 });
    }

    // 3️⃣ Create invoice and update stock in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const itemCreates: Array<{
        name: string;
        price: number;
        quantity: number;
        type: string;
        vaccineId?: string | null;
      }> = [];

      // Check and update stock for vaccines
      for (const item of items) {
        if (item.type === "VACCINE" && item.vaccineId) {
          const vaccine = await tx.vaccine.findUnique({
            where: { id: item.vaccineId },
          });

          if (!vaccine) {
            throw new Error(`Vaccine with ID ${item.vaccineId} not found`);
          }

          const qty = item.quantity || 1;

          if (vaccine.stock < qty) {
            throw new Error(`Insufficient stock for vaccine: ${vaccine.name}`);
          }

          await tx.vaccine.update({
            where: { id: item.vaccineId },
            data: { stock: { decrement: qty } },
          });

          // ✅ price is taken from DB
          itemCreates.push({
            name: vaccine.name,
            price: vaccine.defaultPrice,
            quantity: qty,
            type: "VACCINE",
            vaccineId: item.vaccineId,
          });
        } else {
          // SERVICE (or other types) still must provide name/price
          const qty = item.quantity || 1;
          if (!item.name || typeof item.price !== "number") {
            throw new Error("Invalid service item: name and numeric price are required");
          }
          itemCreates.push({
            name: item.name,
            price: item.price,
            quantity: qty,
            type: item.type,
            vaccineId: item.vaccineId ?? null,
          });
        }
      }

      // 1️⃣ Calculate subtotal based on *effective* prices
      const subtotal = itemCreates.reduce((sum, it) => sum + it.price * it.quantity, 0);

      // 2️⃣ Calculate total after discount
      let total = subtotal;
      if (discountType && discountValue) {
        if (discountType === "PERCENTAGE") {
          total = subtotal - (subtotal * discountValue) / 100;
        } else {
          total = subtotal - discountValue;
        }
      }

      return await tx.invoice.create({
        data: {
          appointmentId,
          subtotal,
          discountType,
          discountValue,
          total,
          items: {
            create: itemCreates,
          },
        },
        include: {
          items: true,
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

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/invoices error:", error);
    if (error.message.includes("Insufficient stock") || error.message.includes("not found")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error.message.includes("Invalid service item")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
