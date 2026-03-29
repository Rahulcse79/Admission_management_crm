"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { User } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Users, ShieldCheck } from "lucide-react";
import { Button, Modal, FormField, Input, Select, PageHeader, LoadingSpinner, EmptyState, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admission_officer" });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get("/auth/users");
      setItems(res.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ name: "", email: "", password: "", role: "admission_officer" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/auth/register", form);
      toast.success("User created");
      setModalOpen(false); fetch();
    } catch { /* */ } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage system users and roles" action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add User</Button>} />

      {items.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No Users" description="No users found." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {item.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                  <p className="text-xs text-zinc-500">{item.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                      <StatusBadge status={item.role.replace(/_/g, " ")} />
                    </div>
                    <span className={`text-xs ${item.is_active ? "text-emerald-600" : "text-zinc-400"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">Joined {formatDate(item.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></FormField>
          <FormField label="Email" required><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></FormField>
          <FormField label="Password" required><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></FormField>
          <FormField label="Role" required>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="admission_officer">Admission Officer</option>
              <option value="management">Management</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
