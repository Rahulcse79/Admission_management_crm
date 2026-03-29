"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Program, Department } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Button, Modal, FormField, Input, Select, PageHeader, LoadingSpinner, EmptyState, StatusBadge } from "@/components/ui";

export default function ProgramsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState({
    name: "", code: "", department_id: "", course_type: "UG",
    duration_years: 4, total_intake: 60, entry_type: "Regular",
    admission_mode: "KCET",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [p, d] = await Promise.all([api.get("/programs"), api.get("/departments")]);
      setItems(p.data ?? []);
      setDepartments(d.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", code: "", department_id: departments[0]?.id ?? "", course_type: "UG", duration_years: 4, total_intake: 60, entry_type: "Regular", admission_mode: "KCET" });
    setModalOpen(true);
  };
  const openEdit = (item: Program) => {
    setEditing(item);
    setForm({ name: item.name, code: item.code, department_id: item.department_id, course_type: item.course_type, duration_years: item.duration_years, total_intake: item.total_intake, entry_type: item.entry_type ?? "Regular", admission_mode: item.admission_mode ?? "KCET" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, duration_years: Number(form.duration_years), total_intake: Number(form.total_intake) };
    try {
      if (editing) { await api.put(`/programs/${editing.id}`, payload); toast.success("Program updated"); }
      else { await api.post("/programs", payload); toast.success("Program created"); }
      setModalOpen(false); fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this program?")) return;
    try { await api.delete(`/programs/${id}`); toast.success("Deleted"); fetchData(); } catch { /* */ }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Programs" description="Manage academic programs and courses" action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Program</Button>} />

      {items.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No Programs" description="Create programs under your departments." action={isAdmin && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Program</Button>} />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-5 py-3 text-left font-medium text-zinc-500">Program</th>
                  <th className="px-5 py-3 text-left font-medium text-zinc-500">Code</th>
                  <th className="px-5 py-3 text-left font-medium text-zinc-500">Type</th>
                  <th className="px-5 py-3 text-left font-medium text-zinc-500">Department</th>
                  <th className="px-5 py-3 text-right font-medium text-zinc-500">Intake</th>
                  <th className="px-5 py-3 text-right font-medium text-zinc-500">Duration</th>
                  {isAdmin && <th className="px-5 py-3 text-right font-medium text-zinc-500">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">{item.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-indigo-600 dark:text-indigo-400">{item.code}</td>
                    <td className="px-5 py-3"><StatusBadge status={item.course_type} /></td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{item.department_name || "—"}</td>
                    <td className="px-5 py-3 text-right text-zinc-600 dark:text-zinc-400">{item.total_intake}</td>
                    <td className="px-5 py-3 text-right text-zinc-600 dark:text-zinc-400">{item.duration_years}yr</td>
                    {isAdmin && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(item.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Program" : "Create Program"} className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Department" required>
            <Select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} required>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Program Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></FormField>
            <FormField label="Code" required><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. BTECH-CSE" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Type" required>
              <Select value={form.course_type} onChange={(e) => setForm({ ...form, course_type: e.target.value })}>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
                <option value="Diploma">Diploma</option>
                <option value="PhD">PhD</option>
              </Select>
            </FormField>
            <FormField label="Entry Type">
              <Select value={form.entry_type} onChange={(e) => setForm({ ...form, entry_type: e.target.value })}>
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Duration (Years)" required><Input type="number" min={1} max={6} value={form.duration_years} onChange={(e) => setForm({ ...form, duration_years: Number(e.target.value) })} required /></FormField>
            <FormField label="Total Intake" required><Input type="number" min={1} value={form.total_intake} onChange={(e) => setForm({ ...form, total_intake: Number(e.target.value) })} required /></FormField>
            <FormField label="Admission Mode">
              <Select value={form.admission_mode} onChange={(e) => setForm({ ...form, admission_mode: e.target.value })}>
                <option value="KCET">KCET</option>
                <option value="COMEDK">COMEDK</option>
                <option value="Management">Management</option>
              </Select>
            </FormField>
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
