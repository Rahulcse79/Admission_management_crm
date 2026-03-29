"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { SeatMatrix, Program, AcademicYear, QuotaAllocation } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Grid3X3, Pencil } from "lucide-react";
import { Button, Modal, FormField, Input, Select, PageHeader, LoadingSpinner, EmptyState, StatusBadge } from "@/components/ui";

const QUOTA_TYPES = ["KCET", "COMEDK", "Management"] as const;

export default function SeatMatrixPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<SeatMatrix[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SeatMatrix | null>(null);
  const [form, setForm] = useState({ program_id: "", academic_year_id: "", total_intake: 60, quotas: QUOTA_TYPES.map((q) => ({ quota_type: q, total_seats: 20, filled_seats: 0, remaining_seats: 20 })) });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, p, y] = await Promise.all([api.get("/seat-matrices"), api.get("/programs"), api.get("/academic-years")]);
      setItems(s.data ?? []);
      setPrograms(p.data ?? []);
      setYears(y.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    const currentYear = years.find((y) => y.is_current);
    setEditing(null);
    setForm({
      program_id: programs[0]?.id ?? "",
      academic_year_id: currentYear?.id ?? years[0]?.id ?? "",
      total_intake: 60,
      quotas: QUOTA_TYPES.map((q) => ({ quota_type: q, total_seats: 20, filled_seats: 0, remaining_seats: 20 })),
    });
    setModalOpen(true);
  };

  const openEdit = (item: SeatMatrix) => {
    setEditing(item);
    setForm({
      program_id: item.program_id,
      academic_year_id: item.academic_year_id,
      total_intake: item.total_intake,
      quotas: item.quotas?.length ? item.quotas : QUOTA_TYPES.map((q) => ({ quota_type: q, total_seats: 20, filled_seats: 0, remaining_seats: 20 })),
    });
    setModalOpen(true);
  };

  const updateQuota = (idx: number, field: keyof QuotaAllocation, value: number) => {
    const updated = [...form.quotas];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === "total_seats") {
      updated[idx].remaining_seats = value - updated[idx].filled_seats;
    }
    setForm({ ...form, quotas: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const totalQuota = form.quotas.reduce((sum, q) => sum + q.total_seats, 0);
    if (totalQuota !== form.total_intake) {
      toast.error(`Quota total (${totalQuota}) must equal intake (${form.total_intake})`);
      setSaving(false); return;
    }
    try {
      if (editing) { await api.put(`/seat-matrices/${editing.id}`, form); toast.success("Seat matrix updated"); }
      else { await api.post("/seat-matrices", form); toast.success("Seat matrix created"); }
      setModalOpen(false); fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Seat Matrix" description="Configure quota-wise seat allocation per program" action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Configure Seats</Button>} />

      {items.length === 0 ? (
        <EmptyState icon={<Grid3X3 className="h-6 w-6" />} title="No Seat Matrix" description="Configure seat allocation for your programs." action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Configure Seats</Button>} />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.program_name || "Program"}</h3>
                  <p className="mt-0.5 text-xs text-zinc-500">Academic Year: {item.academic_year || "—"} · Total Intake: {item.total_intake}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800">
                    <span className="text-zinc-500">Filled:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.total_filled ?? 0}</span>
                    <span className="text-zinc-400">/</span>
                    <span className="text-zinc-600 dark:text-zinc-400">{item.total_intake}</span>
                  </div>
                  {isAdmin && (
                    <button onClick={() => openEdit(item)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {/* Quota bars */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(item.quotas ?? []).map((q) => {
                  const pct = q.total_seats > 0 ? Math.round((q.filled_seats / q.total_seats) * 100) : 0;
                  return (
                    <div key={q.quota_type} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-xs">
                        <StatusBadge status={q.quota_type} />
                        <span className="text-zinc-500">{q.filled_seats}/{q.total_seats}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-indigo-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Seat Matrix" : "Configure Seat Matrix"} className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Program" required>
              <Select value={form.program_id} onChange={(e) => setForm({ ...form, program_id: e.target.value })} required>
                <option value="">Select program</option>
                {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Academic Year" required>
              <Select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} required>
                <option value="">Select year</option>
                {years.map((y) => <option key={y.id} value={y.id}>{y.name || y.year}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Total Intake" required>
            <Input type="number" min={1} value={form.total_intake} onChange={(e) => setForm({ ...form, total_intake: Number(e.target.value) })} required />
          </FormField>
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Quota Allocation <span className="text-xs text-zinc-400">(must total to intake)</span></p>
            <div className="space-y-2">
              {form.quotas.map((q, idx) => (
                <div key={q.quota_type} className="flex items-center gap-3 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                  <span className="w-28 text-sm font-medium text-zinc-700 dark:text-zinc-300">{q.quota_type}</span>
                  <Input type="number" min={0} value={q.total_seats} onChange={(e) => updateQuota(idx, "total_seats", Number(e.target.value))} className="w-24" />
                  <span className="text-xs text-zinc-400">seats</span>
                </div>
              ))}
              <p className="text-right text-xs text-zinc-500">
                Sum: <span className={`font-semibold ${form.quotas.reduce((s, q) => s + q.total_seats, 0) === form.total_intake ? "text-emerald-600" : "text-red-500"}`}>
                  {form.quotas.reduce((s, q) => s + q.total_seats, 0)}
                </span> / {form.total_intake}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
