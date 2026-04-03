import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
  ShieldCheck,
  Stethoscope,
  Users,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  FileText,
  CreditCard
} from "lucide-react";

export default async function LandingPage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "DOCTOR") redirect("/doctor");
    if (user.role === "RECEPTIONIST") redirect("/receptionist");
    if (user.role === "ADMIN") redirect("/receptionist");
    redirect("/appointments");
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Clinic<span className="text-primary">Flow</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
            <a href="#demo" className="hover:text-primary transition-colors">Demo</a>
          </div>
          <Link href="/login">
            <Button variant="default" size="sm" className="hidden sm:flex">Try the demo</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden min-h-[600px] flex items-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/hero-section.jpg"
            alt="Clinic Hero Background"
            fill
            className="object-cover opacity-80"
            priority
          />
          {/* Professional Overlay for Text Contrast */}
          <div className="absolute inset-0 bg-linear-to-b from-white/40 via-white/10 to-white" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 mb-4 animate-in fade-in slide-in-from-bottom-3 duration-1000">
            Professional Clinic Management System
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Streamline your practice, <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-600">elevate patient care.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000">
            ClinicFlow is a modern, all-in-one platform designed for clinics to manage patients, schedule appointments, and digitize medical records seamlessly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 text-lg font-semibold gap-2 shadow-xl shadow-primary/20">
                Test Demo Software <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 -z-10 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-linear-to-b from-primary/5 to-transparent rounded-full blur-3xl opacity-50" />
      </section>

      {/* Problems & Solutions Section */}
      <section id="solutions" className="py-24 bg-slate-50 border-y relative z-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Why ClinicFlow?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We solve the core administrative challenges that modern clinics face every day.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Problems list */}
            <div className="space-y-4 p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">The Problem</h3>
              <p className="text-slate-600">Manual patient record-keeping is slow, prone to errors, and difficult to search through during consultations.</p>
              <div className="pt-4 flex items-start gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-bold">Our Solution</p>
                  <p className="text-sm text-slate-500">A centralized, searchable digital patient registry with full medical history at your fingertips.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">The Problem</h3>
              <p className="text-slate-600">Double-bookings and missed appointments lead to lost revenue and unhappy patients.</p>
              <div className="pt-4 flex items-start gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-bold">Our Solution</p>
                  <p className="text-sm text-slate-500">Real-time appointment scheduling with smart conflict detection and status tracking.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">The Problem</h3>
              <p className="text-slate-600">Complex billing for services and vaccines makes financial tracking a repetitive nightmare.</p>
              <div className="pt-4 flex items-start gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-bold">Our Solution</p>
                  <p className="text-sm text-slate-500">Automated invoicing and payment tracking built directly into the patient workflow.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-24 bg-white relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Built for every role in your clinic.</h2>
                <p className="text-lg text-slate-600">Our platform provides specialized interfaces tailored to the unique needs of your staff.</p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Admin Control</h4>
                    <p className="text-slate-600 font-medium">Manage services, vaccines, and user roles. Deep visibility into clinic operations.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Receptionist Portal</h4>
                    <p className="text-slate-600 font-medium">Fast patient registration, appointment booking, and instant invoice generation.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Doctor Dashboard</h4>
                    <p className="text-slate-600 font-medium">Streamlined medical records, diagnosis tracking, and treatment history.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-linear-to-br from-primary/20 to-blue-500/10 rounded-3xl overflow-hidden shadow-2xl relative p-8 flex flex-col gap-6">
                {/* Analytics card 1 */}
                <div className="bg-white/90 backdrop-blur shadow-lg rounded-xl p-4 border border-slate-100 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-700">Monthly Patients</span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12.5%</span>
                  </div>
                  <div className="flex items-end gap-1 h-20">
                    <div className="flex-1 bg-primary/20 rounded-t-sm h-[40%] animate-in zoom-in duration-1000 delay-200" />
                    <div className="flex-1 bg-primary/30 rounded-t-sm h-[60%] animate-in zoom-in duration-1000 delay-300" />
                    <div className="flex-1 bg-primary/40 rounded-t-sm h-[50%] animate-in zoom-in duration-1000 delay-400" />
                    <div className="flex-1 bg-primary/60 rounded-t-sm h-[80%] animate-in zoom-in duration-1000 delay-500" />
                    <div className="flex-1 bg-primary rounded-t-sm h-full animate-in zoom-in duration-1000 delay-600" />
                  </div>
                </div>

                {/* Analytics card 2 */}
                <div className="bg-white/90 backdrop-blur shadow-lg rounded-xl p-4 border border-slate-100 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-700">Appointment Types</span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Checkups</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[65%] animate-in slide-in-from-left duration-1000 delay-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Vaccinations</span>
                        <span>25%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full w-[25%] animate-in slide-in-from-left duration-1000 delay-700" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Feed mockup */}
                <div className="bg-white/90 backdrop-blur shadow-lg rounded-xl p-4 border border-slate-100 flex-1 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                  <span className="text-sm font-bold text-slate-700 block mb-3">Recent Activity</span>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2 bg-slate-100 rounded w-3/4 animate-pulse" />
                          <div className="h-2 bg-slate-50 rounded w-1/2 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Access Section */}
      <section id="demo" className="py-24 bg-primary text-white overflow-hidden relative z-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ready to try it yourself?</h2>
              <p className="text-xl text-primary-foreground/80">
                Access the full application today. No registration required for testing—just use our demo accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <ShieldCheck className="w-5 h-5" /> Admin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-xs text-primary-foreground/70">Email</p>
                  <code className="text-sm font-bold block pb-2">admin@clinic.com</code>
                  <p className="text-xs text-primary-foreground/70">Password</p>
                  <code className="text-sm font-bold block">admin123</code>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Stethoscope className="w-5 h-5" /> Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-xs text-primary-foreground/70">Email</p>
                  <code className="text-sm font-bold block pb-2">doctor@clinic.com</code>
                  <p className="text-xs text-primary-foreground/70">Password</p>
                  <code className="text-sm font-bold block">doctor123</code>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <LayoutDashboard className="w-5 h-5" /> Receptionist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-xs text-primary-foreground/70">Email</p>
                  <code className="text-sm font-bold block pb-2">receptionist@clinic.com</code>
                  <p className="text-xs text-primary-foreground/70">Password</p>
                  <code className="text-sm font-bold block">receptionist123</code>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="h-14 px-12 text-lg font-bold gap-2">
                  Launch Demo Application <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-40 border-white rounded-full" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-slate-50 relative z-20">
        <div className="container mx-auto px-4 text-center text-slate-500 font-medium">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">ClinicFlow</span>
          </div>
          <p className="mb-2">&copy; 2026 ClinicFlow Management System. All rights reserved.</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
