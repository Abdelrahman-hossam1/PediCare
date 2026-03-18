"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck, Stethoscope, CalendarDays, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import logoPng from "@/assets/images/logo.png";
import loginBackground from "@/assets/images/loginBG.png";

const LoginSchema = z.object({
  // Treat as a normal text input (no client-side email format enforcement)
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setServerError(data?.error || "Login failed");
        return;
      }

      // Cookie is set by the API response
      router.push("/");
      router.refresh();
    } catch {
      setServerError("An error occurred. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 overflow-auto bg-cover bg-center"
      style={{
        backgroundImage: `url(${loginBackground.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Soft overlay for readability (like the mock) */}
      {/* <div className="absolute inset-0 bg-background/65 backdrop-blur-[1px]" /> */}

     
      <div className="relative z-10 min-h-full grid   items-center justify-center">


        {/* Login form */}
        <div className="flex items-start lg:items-center justify-center lg:justify-start  sm:p-8 pt-24 lg:pt-8 lg:pl-4 xl:pl-6">
          <div className="w-full lg:w-[400px]   space-y-4  ">
            <Card className="shadow-lg bg-background/80 backdrop-blur-md border-white/30  ">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>Use your clinic account to continue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          <Input
                            className="border-primary"
                            type="text"
                            autoComplete="email"
                            placeholder="you@example.com"
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
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <span className="text-xs text-muted-foreground">Contact admin if you forgot it</span>
                        </div>
                        <FormControl>
                          <Input className="border-primary" type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
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

              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Test credentials</p>
                <div className="mt-2 grid gap-1">
                  <div className="flex items-center justify-between">
                    <span>Admin</span>
                    <code className="rounded bg-muted px-2 py-0.5 text-xs">hossam / hossam</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Doctor</span>
                    <code className="rounded bg-muted px-2 py-0.5 text-xs">nono / nono</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-white text-muted-foreground">
            By continuing, you agree to your clinic&apos;s security policies.
          </p>
          </div>
        </div>

      </div>
    </div>
  );
}
