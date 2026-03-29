"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Department, Campus } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { Button, Modal, FormField, Input, Select, PageHeader, LoadingSpinner, EmptyState } from "@/components/ui";

export default function DepartmentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<Department[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", code: "", campus_id: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [d, c] = await Promise.all([api.get("/departments"), api.get("/campuses")]);
      setItems(d.data ?? []);
      setCampuses(c.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({ name: "", code: "", campus_id: campuses[0]?.id ?? "" }); setModalOpen(true); };
  const openEdit = (item: Department) => { setEditing(item); setForm({ name: item.name, code: item.code, campus_id: item.campus_id }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await api.put(`/departments/${editing.id}`, form); toast.success("Department updated"); }
      else { await api.post("/departments", form); toast.success("Department created"); }
      setModalOpen(false); fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    try { await api.delete(`/departments/${id}`); toast.success("Deleted"); fetchData(); } catch { /* */ }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" description="Manage academic departments" action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Department</Button>} />

      {items.length === 0 ? (
        <EmptyState icon={<Layers className="h-6 w-6" />} title="No Departments" description="Create departments under your campuses." action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Department</Button>} />
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
              <p className="mt-2 text-xs text-zinc-500">Campus: <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.campus_name || "—"}</span></p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Department" : "Create Department"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Campus" required>
            <Select value={form.campus_id} onChange={(e) => setForm({ ...form, campus_id: e.target.value })} required>
              <option value="">Select campus</option>
              {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Department Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></FormField>
          <FormField label="Code" required><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. CSE" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
