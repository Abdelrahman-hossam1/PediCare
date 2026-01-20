import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canRead } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/getCurrentUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  createdAt: Date;
};

async function getPatients(): Promise<Patient[]> {
  const user = await getCurrentUser();
  if (!user || !canRead(user.role)) redirect("/login");

  return prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  });
}

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center m-auto w-full justify-between ">
          <p className="text-2xl rounded-lg bg-primary text-white font-semibold p-3">Patients</p>
        <Link
          href="/patients/new"
          className="rounded-md bg-primary px-4 py-2  text-primary-foreground"
        >
          Add patient
        </Link>
      </div>
     

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-primary text-primary-foreground">
            <TableRow className="hover:bg-primary">
              <TableHead className="text-primary-foreground" >Name</TableHead>
              <TableHead className="text-primary-foreground" >Phone</TableHead>
              <TableHead className="text-primary-foreground" >Email</TableHead>
              <TableHead className="text-primary-foreground" >Profile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.firstName} {p.lastName}
                </TableCell>
                <TableCell>{p.phone}</TableCell>
                <TableCell>{p.email ?? "-"}</TableCell>
                <TableCell>
                  <Link className="underline" href={`/patients/${p.id}`}>
                    Open
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {patients.length === 0 && (
              <TableRow>
                <TableCell className="text-gray-500" colSpan={4}>
                  No patients yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}