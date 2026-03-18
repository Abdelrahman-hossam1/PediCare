import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { AdminPortal } from "./admin-portal";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!["ADMIN", "DOCTOR"].includes(user.role)) {
    return <div className="p-6">Forbidden.</div>;
  }

  return (
    <div className="p-6">
      <AdminPortal />
    </div>
  );
}

