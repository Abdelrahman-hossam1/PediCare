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
        backgroundImage: `url('/loginBG.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Professional Overlay for Dark Mode Readability */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-0" />

      <div className="relative z-10 min-h-full grid items-center justify-center">

        {/* Login form */}
        <div className="flex items-start lg:items-center justify-center lg:justify-start  sm:p-8 pt-24 lg:pt-8 lg:pl-4 xl:pl-6">
          <div className="w-full lg:w-[400px]   space-y-4  ">
            <Card className="shadow-lg bg-background/80 backdrop-blur-md border-white/30  ">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-white/10 p-1.5 border border-white/20">
                    <Image
                      src="/logo-v2.png"
                      alt="PediCare Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xl font-bold tracking-tight">Pedi<span className="text-primary">Care</span></span>
                </div>
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

                <div className="rounded-lg border bg-muted/40 p-4 text-sm ">
                  <p className="font-bold text-white mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Demo Access Credentials
                  </p>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-2 rounded  shadow-sm border border-primary rounded-lg ">
                      <span className="font-medium text-white">Admin</span>
                      <code className="text-primary font-mono font-bold">admin@clinic.com / admin123</code>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded  shadow-sm border border-primary rounded-lg">
                      <span className="font-medium text-white">Doctor</span>
                      <code className="text-primary font-mono font-bold">doctor@clinic.com / doctor123</code>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded  shadow-sm border border-primary rounded-lg">
                      <span className="font-medium text-white">Receptionist</span>
                      <code className="text-primary font-mono font-bold">receptionist@clinic.com / receptionist123</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to your clinic&apos;s security policies.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
