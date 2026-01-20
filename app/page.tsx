import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "DOCTOR") redirect("/doctor");
  if (user.role === "RECEPTIONIST") redirect("/receptionist");
  if (user.role === "ADMIN") redirect("/receptionist");

  // fallback
  redirect("/appointments");
}
