import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import {
  CalendarDays,
  ClipboardList,
  Settings,
  Users,
  LayoutDashboard,
  Syringe,
  Building2
} from "lucide-react"
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
      {
        href: "/doctor",
        label: "Dashboard",
        show: role === "DOCTOR" || role === "ADMIN",
        icon: LayoutDashboard
      },
      {
        href: "/receptionist",
        label: "Dashboard",
        show: role === "RECEPTIONIST",
        icon: LayoutDashboard
      },
      {
        href: "/appointments",
        label: "Appointments",
        show: role !== null,
        icon: CalendarDays,
      },
      {
        href: "/patients",
        label: "Patients",
        show: role !== null,
        icon: Users
      },
      {
        href: "/medical-records",
        label: "Medical Records",
        show: role !== null,
        icon: ClipboardList,
      }
    ]

  const bottomItems: Array<{
    href: string
    label: string
    show: boolean
    icon: React.ComponentType<{ className?: string }>
  }> = [
      {
        href: "/admin",
        label: "Admin Portal",
        show: role === "ADMIN",
        icon: Building2,
      }
    ]

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Image
              src={logoPng}
              alt="PediCare"
              width={28}
              height={28}
              priority
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">PediCare</h1>
            <p className="text-xs text-muted-foreground">Clinic Management</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((i) => i.show)
                .map((i) => {
                  const Icon = i.icon
                  return (
                    <SidebarMenuItem key={i.href + i.label}>
                      <SidebarMenuButton asChild className="h-10">
                        <Link href={i.href} className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{i.label}</span>
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

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          {bottomItems
            .filter((i) => i.show)
            .map((i) => {
              const Icon = i.icon
              return (
                <SidebarMenuItem key={i.href + i.label}>
                  <SidebarMenuButton asChild className="h-10">
                    <Link href={i.href} className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{i.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}