"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Campus, Institution } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Button, Modal, FormField, Input, Select, PageHeader, LoadingSpinner, EmptyState } from "@/components/ui";

export default function CampusesPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<Campus[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campus | null>(null);
  const [form, setForm] = useState({ name: "", code: "", institution_id: "", address: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [c, i] = await Promise.all([api.get("/campuses"), api.get("/institutions")]);
      setItems(c.data ?? []);
      setInstitutions(i.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({ name: "", code: "", institution_id: institutions[0]?.id ?? "", address: "" }); setModalOpen(true); };
  const openEdit = (item: Campus) => { setEditing(item); setForm({ name: item.name, code: item.code, institution_id: item.institution_id, address: item.address ?? "" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await api.put(`/campuses/${editing.id}`, form); toast.success("Campus updated"); }
      else { await api.post("/campuses", form); toast.success("Campus created"); }
      setModalOpen(false); fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campus?")) return;
    try { await api.delete(`/campuses/${id}`); toast.success("Deleted"); fetchData(); } catch { /* */ }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Campuses" description="Manage campus locations" action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Campus</Button>} />

      {items.length === 0 ? (
        <EmptyState icon={<MapPin className="h-6 w-6" />} title="No Campuses" description="Add campuses under your institutions." action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Campus</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                  <p className="mt-0.5 text-xs font-mono text-indigo-600 dark:text-indigo-400">{item.code}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-zinc-500">Institution: <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.institution_name || "—"}</span></p>
              {item.address && <p className="mt-1 text-sm text-zinc-500">{item.address}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Campus" : "Create Campus"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Institution" required>
            <Select value={form.institution_id} onChange={(e) => setForm({ ...form, institution_id: e.target.value })} required>
              <option value="">Select institution</option>
              {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Campus Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></FormField>
          <FormField label="Code" required><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. MAIN" /></FormField>
          <FormField label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
