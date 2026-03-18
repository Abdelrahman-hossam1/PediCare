"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useConfirmDialog } from "@/components/confirm-dialog-provider"

export function CheckInAppointmentButton({
  appointmentId,
  onError,
  disabled,
  className,
}: {
  appointmentId: string
  onError?: (message: string) => void
  disabled?: boolean
  className?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      className={className}
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await fetch(`/api/appointments/${appointmentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "CONFIRMED" }),
          })

          if (!res.ok) {
            const body = await res.json().catch(() => null)
            const message = body?.message || "Failed to check in appointment"
            if (onError) onError(message)
            else window.alert(message)
            return
          }

          // Re-render server data (re-fetches receptionist page list/stats)
          router.refresh()
        })
      }}
    >
      {isPending ? "Checking in..." : "Check In"}
    </Button>
  )
}

export function DeleteAppointmentButton({
  appointmentId,
  redirectTo,
  onError,
  disabled,
  className,
}: {
  appointmentId: string
  redirectTo?: string
  onError?: (message: string) => void
  disabled?: boolean
  className?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const confirmDialog = useConfirmDialog()

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={disabled || isPending}
      onClick={() => {
        void (async () => {
          const ok = await confirmDialog({
            title: "Delete appointment?",
            description: "This will permanently delete the appointment.",
            confirmText: "Delete",
            cancelText: "Cancel",
            confirmVariant: "destructive",
          })
          if (!ok) return

          startTransition(async () => {
            const res = await fetch(`/api/appointments/${appointmentId}`, {
              method: "DELETE",
            })

            if (!res.ok) {
              const body = await res.json().catch(() => null)
              const message = body?.message || "Failed to delete appointment"
              if (onError) onError(message)
              else window.alert(message)
              return
            }

            if (redirectTo) {
              router.push(redirectTo)
            }

            // Re-render server data
            router.refresh()
          })
        })()
      }}
    >
      Delete
    </Button>
  )
}

