"use client"

import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const LoginSchema = z.object({
  // Treat as a normal text input (no client-side email format enforcement)
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
})

type LoginValues = z.infer<typeof LoginSchema>

export default function LoginPage() {
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setServerError(data?.error || "Login failed")
        return
      }

      // Cookie is set by the API response
      window.location.href = "/"
    } catch {
      setServerError("An error occurred. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h2 className="text-3xl font-semibold">Sign in</h2>
          <p className="text-sm text-muted-foreground">Clinic Management System</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Test credentials:</p>
          <p className="mt-1">
            <code className="rounded bg-muted px-2 py-1 text-xs">
              admin@clinic.com / adminpassword
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}
