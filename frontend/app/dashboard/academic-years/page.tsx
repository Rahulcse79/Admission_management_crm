"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { AcademicYear } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Pencil, CalendarDays, Check } from "lucide-react";
import { Button, Modal, FormField, Input, PageHeader, LoadingSpinner, EmptyState, StatusBadge } from "@/components/ui";

export default function AcademicYearsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicYear | null>(null);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get("/academic-years");
      setItems(res.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setForm({ name: "", start_date: "", end_date: "" }); setModalOpen(true); };
  const openEdit = (item: AcademicYear) => {
    setEditing(item);
    setForm({
      name: item.name,
      start_date: item.start_date?.slice(0, 10) ?? "",
      end_date: item.end_date?.slice(0, 10) ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = {
      ...form,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
    };
    try {
      if (editing) { await api.put(`/academic-years/${editing.id}`, payload); toast.success("Academic year updated"); }
      else { await api.post("/academic-years", payload); toast.success("Academic year created"); }
      setModalOpen(false); fetch();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleSetCurrent = async (id: string) => {
    try { await api.put(`/academic-years/${id}/set-current`); toast.success("Current year updated"); fetch(); } catch { /* */ }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Academic Years" description="Configure admission academic years" action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Year</Button>} />

      {items.length === 0 ? (
        <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No Academic Years" description="Create an academic year to start managing admissions." action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Year</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className={`rounded-xl border p-5 transition-all hover:shadow-md ${item.is_current ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {item.is_current && <StatusBadge status="Current" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" />}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    {!item.is_current && (
                      <button onClick={() => handleSetCurrent(item.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20" title="Set as current">
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><Pencil className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                {item.start_date && <span>Start: {new Date(item.start_date).toLocaleDateString()}</span>}
                {item.end_date && <span>End: {new Date(item.end_date).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Academic Year" : "Create Academic Year"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. 2026-27" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></FormField>
            <FormField label="End Date"><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></FormField>
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
