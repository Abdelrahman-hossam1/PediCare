import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { SearchInput } from "@/components/search-input";
import { UserNav } from "@/components/user-nav";
import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PediCare - Clinic Management",
  description: "Modern clinic management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const isAuthed = Boolean(user?.role);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ConfirmDialogProvider>
          {isAuthed ? (
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-6">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger />
                  </div>
                  <SearchInput className="hidden md:flex" />
                  {user && (
                    <UserNav user={{ email: user.email ?? "", role: user.role ?? "" }} />
                  )}
                </header>
                <main className="flex-1 p-4 md:p-6">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <main className="w-full">{children}</main>
          )}
        </ConfirmDialogProvider>
      </body>
    </html>
  );
}
