"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Institution } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { Button, Modal, FormField, Input, PageHeader, LoadingSpinner, EmptyState } from "@/components/ui";

export default function InstitutionsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Institution | null>(null);
  const [form, setForm] = useState({ name: "", code: "", address: "", contact_email: "", contact_phone: "" });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get("/institutions");
      setItems(res.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setForm({ name: "", code: "", address: "", contact_email: "", contact_phone: "" }); setModalOpen(true); };
  const openEdit = (item: Institution) => { setEditing(item); setForm({ name: item.name, code: item.code, address: item.address ?? "", contact_email: item.contact_email ?? "", contact_phone: item.contact_phone ?? "" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await api.put(`/institutions/${editing.id}`, form); toast.success("Institution updated"); }
      else { await api.post("/institutions", form); toast.success("Institution created"); }
      setModalOpen(false); fetch();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this institution?")) return;
    try { await api.delete(`/institutions/${id}`); toast.success("Deleted"); fetch(); } catch { /* */ }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Institutions" description="Manage affiliated institutions" action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Institution</Button>} />

      {items.length === 0 ? (
        <EmptyState icon={<Building2 className="h-6 w-6" />} title="No Institutions" description="Create your first institution to get started." action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Institution</Button>} />
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
              {item.address && <p className="mt-3 text-sm text-zinc-500">{item.address}</p>}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
                {item.contact_email && <span>{item.contact_email}</span>}
                {item.contact_phone && <span>{item.contact_phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Institution" : "Create Institution"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></FormField>
          <FormField label="Code" required><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. VTU" /></FormField>
          <FormField label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email"><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></FormField>
            <FormField label="Phone"><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></FormField>
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
