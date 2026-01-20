"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { logout } from "@/lib/logout"

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-start"
      disabled={isLoading}
      onClick={async () => {
        await logout();
        router.push("/login");
        router.refresh();
      }}
    >
      <LogOut className="size-4" />
      Logout
    </Button>
  )
}
