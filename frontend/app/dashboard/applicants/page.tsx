"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Applicant, Program, AcademicYear } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, UserPlus, Search, ChevronLeft, ChevronRight, FileText, DollarSign } from "lucide-react";
import { Button, Modal, FormField, Input, Select, PageHeader, LoadingSpinner, EmptyState, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const CATEGORIES = ["GM", "SC", "ST", "OBC", "2A", "2B", "3A", "3B"] as const;
const QUOTA_TYPES = ["KCET", "COMEDK", "Management"] as const;

export default function ApplicantsPage() {
  const { user } = useAuthStore();
  const canCreate = user?.role === "admin" || user?.role === "admission_officer";
  const [items, setItems] = useState<Applicant[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const emptyForm = {
    first_name: "", last_name: "", email: "", phone: "", date_of_birth: "",
    gender: "Male", category: "GM" as string, address: "", program_id: "",
    academic_year_id: "", entry_type: "Regular", quota_type: "KCET" as string,
    admission_mode: "KCET", allotment_number: "", qualifying_exam: "", marks: 0, rank: 0,
  };
  const [form, setForm] = useState(emptyForm);

  // Detail / document / fee modals
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Applicant | null>(null);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [feeStatus, setFeeStatus] = useState("Pending");

  const fetchData = useCallback(async () => {
    try {
      const [a, p, y] = await Promise.all([
        api.get(`/applicants?page=${page}&per_page=${limit}`),
        api.get("/programs"),
        api.get("/academic-years"),
      ]);
      setItems(a.data.data ?? []);
      setTotal(a.data.total ?? 0);
      setPrograms(p.data ?? []);
      setYears(y.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    const currentYear = years.find((y) => y.is_current);
    setForm({ ...emptyForm, program_id: programs[0]?.id ?? "", academic_year_id: currentYear?.id ?? years[0]?.id ?? "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, marks: Number(form.marks), rank: Number(form.rank) || undefined };
    try {
      await api.post("/applicants", payload);
      toast.success("Applicant created");
      setModalOpen(false); fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const openDetail = (a: Applicant) => { setSelected(a); setDetailOpen(true); };

  const handleDocVerify = async (docName: string, status: string) => {
    if (!selected) return;
    try {
      await api.put(`/applicants/${selected.id}/documents`, { documents: selected.documents.map((d) => d.name === docName ? { ...d, status } : d) });
      toast.success("Document updated");
      const res = await api.get(`/applicants/${selected.id}`);
      setSelected(res.data);
      fetchData();
    } catch { /* */ }
  };

  const openFeeModal = (a: Applicant) => { setSelected(a); setFeeStatus(a.fee_status); setFeeModalOpen(true); };
  const handleFeeUpdate = async () => {
    if (!selected) return;
    try {
      await api.put(`/applicants/${selected.id}/fee-status`, { fee_status: feeStatus });
      toast.success("Fee status updated");
      setFeeModalOpen(false); fetchData();
    } catch { /* */ }
  };

  const filtered = search
    ? items.filter((a) =>
        `${a.first_name} ${a.last_name} ${a.application_number} ${a.email}`.toLowerCase().includes(search.toLowerCase()))
    : items;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Applicants" description="Manage applicant records and documents" action={canCreate && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>New Applicant</Button>} />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input className="pl-10" placeholder="Search by name, email, or application #..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<UserPlus className="h-6 w-6" />} title="No Applicants" description="Create your first applicant record." action={canCreate && <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>New Applicant</Button>} />
      ) : (
        <>
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">App #</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Program</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Quota</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Fee</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600 dark:text-indigo-400">{a.application_number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{a.first_name} {a.last_name}</p>
                        <p className="text-xs text-zinc-500">{a.email}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{a.program_name || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.quota_type} /></td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3"><StatusBadge status={a.fee_status} /></td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(a.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openDetail(a)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800" title="Documents"><FileText className="h-4 w-4" /></button>
                          {canCreate && <button onClick={() => openFeeModal(a)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800" title="Fee status"><DollarSign className="h-4 w-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)} icon={<ChevronLeft className="h-4 w-4" />}>Prev</Button>
              <Button variant="secondary" disabled={page * limit >= total} onClick={() => setPage(page + 1)} icon={<ChevronRight className="h-4 w-4" />}>Next</Button>
            </div>
          </div>
        </>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Applicant" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required /></FormField>
            <FormField label="Last Name" required><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" required><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></FormField>
            <FormField label="Phone" required><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Date of Birth" required><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} required /></FormField>
            <FormField label="Gender" required>
              <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </Select>
            </FormField>
            <FormField label="Category" required>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></FormField>
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
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Entry Type">
              <Select value={form.entry_type} onChange={(e) => setForm({ ...form, entry_type: e.target.value })}>
                <option value="Regular">Regular</option><option value="Lateral">Lateral</option>
              </Select>
            </FormField>
            <FormField label="Quota Type" required>
              <Select value={form.quota_type} onChange={(e) => setForm({ ...form, quota_type: e.target.value })}>
                {QUOTA_TYPES.map((q) => <option key={q} value={q}>{q}</option>)}
              </Select>
            </FormField>
            <FormField label="Allotment #"><Input value={form.allotment_number} onChange={(e) => setForm({ ...form, allotment_number: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Qualifying Exam" required><Input value={form.qualifying_exam} onChange={(e) => setForm({ ...form, qualifying_exam: e.target.value })} required placeholder="e.g. CET 2026" /></FormField>
            <FormField label="Marks" required><Input type="number" step="0.01" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} required /></FormField>
            <FormField label="Rank"><Input type="number" value={form.rank} onChange={(e) => setForm({ ...form, rank: Number(e.target.value) })} /></FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Applicant</Button>
          </div>
        </form>
      </Modal>

      {/* Detail / Documents Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Applicant: ${selected?.first_name} ${selected?.last_name}`} className="max-w-lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-zinc-500">Application #:</span> <span className="font-mono text-indigo-600 dark:text-indigo-400">{selected.application_number}</span></div>
              <div><span className="text-zinc-500">Status:</span> <StatusBadge status={selected.status} /></div>
              <div><span className="text-zinc-500">Program:</span> <span className="text-zinc-900 dark:text-zinc-100">{selected.program_name}</span></div>
              <div><span className="text-zinc-500">Quota:</span> <StatusBadge status={selected.quota_type} /></div>
              <div><span className="text-zinc-500">Marks:</span> <span className="text-zinc-900 dark:text-zinc-100">{selected.marks}</span></div>
              <div><span className="text-zinc-500">Fee:</span> <StatusBadge status={selected.fee_status} /></div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Document Checklist</h4>
              <div className="space-y-2">
                {selected.documents?.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={doc.status} />
                      {canCreate && doc.status !== "Verified" && (
                        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleDocVerify(doc.name, "Verified")}>Verify</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Fee Status Modal */}
      <Modal open={feeModalOpen} onClose={() => setFeeModalOpen(false)} title="Update Fee Status">
        <div className="space-y-4">
          <FormField label="Fee Status">
            <Select value={feeStatus} onChange={(e) => setFeeStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Waived">Waived</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setFeeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleFeeUpdate}>Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
