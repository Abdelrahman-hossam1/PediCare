import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, ClipboardList, Stethoscope, Users } from "lucide-react"
import { LogoutButton } from "@/components/logoutButton"
import { getCurrentUser } from "@/lib/getCurrentUser"
import logoPng from "@/assets/images/logo.png"

export async function AppSidebar() {
  const user = await getCurrentUser()
  const role = user?.role ?? null

  const navItems: Array<{
    href: string
    label: string
    show: boolean
    icon: React.ComponentType<{ className?: string }>
  }> = [
    { href: "/patients", label: "Patients", show: role !== null, icon: Users },
    {
      href: "/appointments",
      label: "Appointments",
      show: role !== null,
      icon: CalendarDays,
    },
    {
      href: "/medical-records",
      label: "Medical records",
      show: role !== null,
      icon: ClipboardList,
    },
    {
      href: "/receptionist",
      label: "Receptionist",
      show: role === "ADMIN" || role === "RECEPTIONIST",
      icon: Stethoscope,
    },
    {
      href: "/doctor",
      label: "Doctor",
      show: role === "ADMIN" || role === "DOCTOR",
      icon: Stethoscope,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <Image src={logoPng} alt="Clinic" width={140} height={40} priority />
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((i) => i.show)
                .map((i) => {
                  const Icon = i.icon
                  return (
                    <SidebarMenuItem key={i.href}>
                      <SidebarMenuButton asChild>
                        <Link href={i.href}>
                          <Icon className="size-4" />
                          <span>{i.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2 py-1">
          <div className="text-xs text-sidebar-foreground/70">
            {role ? `Role: ${role}` : "Not logged in"}
          </div>
          {role ? <LogoutButton /> : null}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}