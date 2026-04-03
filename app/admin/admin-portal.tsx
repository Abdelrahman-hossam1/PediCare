"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Package, Plus, RefreshCw, Search, Syringe } from "lucide-react";

type Service = {
  id: string;
  name: string;
  defaultPrice: number;
  isActive: boolean;
};

type Vaccine = {
  id: string;
  name: string;
  manufacturer: string | null;
  stock: number;
  defaultPrice: number;
};

const LOW_STOCK_THRESHOLD = 20;
const MAX_STOCK = 100; // For progress bar visualization

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function getStockStatus(stock: number) {
  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      badge: <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
        <AlertTriangle className="h-3 w-3" />
        Low Stock
      </Badge>,
      progressColor: "bg-red-500",
    };
  }
  return {
    badge: <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">In Stock</Badge>,
    progressColor: "bg-green-500",
  };
}

export function AdminPortal() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);

  const [vaccineQuery, setVaccineQuery] = useState("");

  // dialogs
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [editServiceOpen, setEditServiceOpen] = useState(false);
  const [serviceDraft, setServiceDraft] = useState<{
    id?: string;
    name: string;
    price: string;
  }>({ name: "", price: "" });

  const [addVaccineOpen, setAddVaccineOpen] = useState(false);
  const [editVaccineOpen, setEditVaccineOpen] = useState(false);
  const [vaccineDraft, setVaccineDraft] = useState<{
    id?: string;
    name: string;
    manufacturer: string;
    stock: string;
    price: string;
  }>({ name: "", manufacturer: "", stock: "", price: "" });

  async function loadAll() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const [svc, vac] = await Promise.all([
        fetch("/api/services", { cache: "no-store" }).then(jsonOrThrow),
        fetch("/api/vaccines", { cache: "no-store" }).then(jsonOrThrow),
      ]);
      setServices(svc);
      setVaccines(vac);
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const filteredVaccines = useMemo(() => {
    const q = vaccineQuery.trim().toLowerCase();
    if (!q) return vaccines;
    return vaccines.filter((v) => {
      const m = (v.manufacturer ?? "").toLowerCase();
      return v.name.toLowerCase().includes(q) || m.includes(q);
    });
  }, [vaccines, vaccineQuery]);

  const lowStockCount = useMemo(() => {
    return vaccines.filter(v => v.stock <= LOW_STOCK_THRESHOLD).length;
  }, [vaccines]);

  async function createService() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const payload = {
        name: serviceDraft.name.trim(),
        defaultPrice: Number(serviceDraft.price),
      };
      const created = await fetch("/api/services", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).then(jsonOrThrow);

      setServices((prev) => [created, ...prev]);
      setAddServiceOpen(false);
      setServiceDraft({ name: "", price: "" });
      setMessage("Service created.");
    } catch (e: any) {
      setError(e?.message || "Failed to create service");
    } finally {
      setLoading(false);
    }
  }

  async function updateService() {
    if (!serviceDraft.id) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const payload: any = {
        name: serviceDraft.name.trim(),
        defaultPrice: Number(serviceDraft.price),
      };
      const updated = await fetch(`/api/services/${serviceDraft.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).then(jsonOrThrow);

      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditServiceOpen(false);
      setServiceDraft({ name: "", price: "" });
      setMessage("Service updated.");
    } catch (e: any) {
      setError(e?.message || "Failed to update service");
    } finally {
      setLoading(false);
    }
  }

  async function createVaccine() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const payload = {
        name: vaccineDraft.name.trim(),
        manufacturer: vaccineDraft.manufacturer.trim() || undefined,
        stock: Number(vaccineDraft.stock),
        defaultPrice: Number(vaccineDraft.price),
      };
      const created = await fetch("/api/vaccines", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).then(jsonOrThrow);

      setVaccines((prev) => [created, ...prev]);
      setAddVaccineOpen(false);
      setVaccineDraft({ name: "", manufacturer: "", stock: "", price: "" });
      setMessage("Vaccine created.");
    } catch (e: any) {
      setError(e?.message || "Failed to create vaccine");
    } finally {
      setLoading(false);
    }
  }

  async function updateVaccine() {
    if (!vaccineDraft.id) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const payload: any = {
        name: vaccineDraft.name.trim(),
        manufacturer: vaccineDraft.manufacturer.trim() || null,
        stock: Number(vaccineDraft.stock),
        defaultPrice: Number(vaccineDraft.price),
      };
      const updated = await fetch(`/api/vaccines/${vaccineDraft.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).then(jsonOrThrow);

      setVaccines((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setEditVaccineOpen(false);
      setVaccineDraft({ name: "", manufacturer: "", stock: "", price: "" });
      setMessage("Vaccine updated.");
    } catch (e: any) {
      setError(e?.message || "Failed to update vaccine");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vaccine Inventory</h1>
          <p className="text-muted-foreground">Manage vaccine stock and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={loading} onClick={loadAll}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setVaccineDraft({ name: "", manufacturer: "", stock: "", price: "" });
              setAddVaccineOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vaccine
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <AlertDescription className="text-green-500">{message}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Alert className="bg-amber-500/10 border-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-amber-500/90">
            {lowStockCount} vaccine{lowStockCount !== 1 ? "s are" : " is"} running low on stock. Please reorder soon.
          </AlertDescription>
        </Alert>
      )}

      {/* Vaccine Stock Overview */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Vaccine Stock Overview</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={vaccineQuery}
                onChange={(e) => setVaccineQuery(e.target.value)}
                placeholder="Search vaccines..."
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">Vaccine Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead className="w-[200px]">Stock</TableHead>
                <TableHead>Price (EGP)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVaccines.map((vaccine) => {
                const status = getStockStatus(vaccine.stock);
                const progressValue = Math.min((vaccine.stock / MAX_STOCK) * 100, 100);
                return (
                  <TableRow key={vaccine.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Syringe className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{vaccine.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {vaccine.manufacturer || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{vaccine.stock} units</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full transition-all ${status.progressColor}`}
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{vaccine.defaultPrice.toFixed(2)}</TableCell>
                    <TableCell>{status.badge}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loading}
                          onClick={() => {
                            setVaccineDraft({
                              id: vaccine.id,
                              name: vaccine.name,
                              manufacturer: vaccine.manufacturer ?? "",
                              stock: String(vaccine.stock),
                              price: String(vaccine.defaultPrice),
                            });
                            setEditVaccineOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={loading}
                          onClick={() => {
                            setVaccineDraft({
                              id: vaccine.id,
                              name: vaccine.name,
                              manufacturer: vaccine.manufacturer ?? "",
                              stock: String(vaccine.stock + 50),
                              price: String(vaccine.defaultPrice),
                            });
                            setEditVaccineOpen(true);
                          }}
                        >
                          Restock
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredVaccines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No vaccines found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Service Prices</CardTitle>
              <p className="text-sm text-muted-foreground">Add services (كشف / consultation / lab tests) and update prices.</p>
            </div>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => {
                setServiceDraft({ name: "", price: "" });
                setAddServiceOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Price (EGP)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="text-right">{service.defaultPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        setServiceDraft({
                          id: service.id,
                          name: service.name,
                          price: String(service.defaultPrice),
                        });
                        setEditServiceOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No services yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add service dialog */}
      <Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
            <DialogDescription>Set a name and a default price.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Service Name</label>
              <Input
                value={serviceDraft.name}
                onChange={(e) => setServiceDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder='e.g. "كشف"'
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Price (SAR)</label>
              <Input
                value={serviceDraft.price}
                onChange={(e) => setServiceDraft((p) => ({ ...p, price: e.target.value }))}
                placeholder="e.g. 200"
                inputMode="numeric"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={loading} onClick={() => setAddServiceOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={createService}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit service dialog */}
      <Dialog open={editServiceOpen} onOpenChange={setEditServiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the service name/price.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Service Name</label>
              <Input
                value={serviceDraft.name}
                onChange={(e) => setServiceDraft((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Price (EGP)</label>
              <Input
                value={serviceDraft.price}
                onChange={(e) => setServiceDraft((p) => ({ ...p, price: e.target.value }))}
                inputMode="numeric"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={loading} onClick={() => setEditServiceOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={updateService}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add vaccine dialog */}
      <Dialog open={addVaccineOpen} onOpenChange={setAddVaccineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vaccine</DialogTitle>
            <DialogDescription>Add a vaccine and set stock + price.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Vaccine Name</label>
              <Input
                value={vaccineDraft.name}
                onChange={(e) => setVaccineDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Hepatitis B"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Manufacturer</label>
              <Input
                value={vaccineDraft.manufacturer}
                onChange={(e) => setVaccineDraft((p) => ({ ...p, manufacturer: e.target.value }))}
                placeholder="e.g. GSK"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Stock</label>
                <Input
                  value={vaccineDraft.stock}
                  onChange={(e) => setVaccineDraft((p) => ({ ...p, stock: e.target.value }))}
                  inputMode="numeric"
                  placeholder="e.g. 50"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Price (SAR)</label>
                <Input
                  value={vaccineDraft.price}
                  onChange={(e) => setVaccineDraft((p) => ({ ...p, price: e.target.value }))}
                  inputMode="numeric"
                  placeholder="e.g. 120"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={loading} onClick={() => setAddVaccineOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={createVaccine}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit vaccine dialog */}
      <Dialog open={editVaccineOpen} onOpenChange={setEditVaccineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vaccine</DialogTitle>
            <DialogDescription>Update manufacturer, stock and price.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Vaccine Name</label>
              <Input
                value={vaccineDraft.name}
                onChange={(e) => setVaccineDraft((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Manufacturer</label>
              <Input
                value={vaccineDraft.manufacturer}
                onChange={(e) => setVaccineDraft((p) => ({ ...p, manufacturer: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Stock</label>
                <Input
                  value={vaccineDraft.stock}
                  onChange={(e) => setVaccineDraft((p) => ({ ...p, stock: e.target.value }))}
                  inputMode="numeric"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Price (EGP)</label>
                <Input
                  value={vaccineDraft.price}
                  onChange={(e) => setVaccineDraft((p) => ({ ...p, price: e.target.value }))}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={loading} onClick={() => setEditVaccineOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={updateVaccine}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
