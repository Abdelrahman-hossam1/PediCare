import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canRead, canWrite } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { forbidden, unauthorized } from "@/lib/apiResponses";

const PatientUpdateSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    dateOfBirth: z.string().datetime().optional(),
    phone: z.string().min(8).optional(),
    email: z
        .string()
        .email()
        .optional()
        .or(z.literal(""))
        .transform((v) => (v ? v : undefined)),
    address: z.string().optional(),
    bloodType: z
        .enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"])
        .optional(),
    allergies: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
});

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return unauthorized();
        if (!canRead(user.role)) return unauthorized();

        const { id } = await params;

        const patient = await prisma.patient.findUnique({
            where: { id },
        });

        if (!patient) {
            return NextResponse.json({ message: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json(patient);
    } catch (error) {
        console.error("GET /api/patients/[id] error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return unauthorized();
        if (!canWrite(user.role)) return forbidden();

        const { id } = await params;
        const body = await req.json();
        const parsed = PatientUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Validation error", errors: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const data = parsed.data;
        const updateData: any = { ...data };
        if (data.dateOfBirth) {
            updateData.dateOfBirth = new Date(data.dateOfBirth);
        }

        const patient = await prisma.patient.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(patient);
    } catch (error) {
        console.error("PATCH /api/patients/[id] error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return unauthorized();
        if (!canWrite(user.role)) return forbidden();

        const { id } = await params;

        // Soft delete
        const patient = await prisma.patient.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json({ message: "Patient deactivated", patient });
    } catch (error) {
        console.error("DELETE /api/patients/[id] error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
