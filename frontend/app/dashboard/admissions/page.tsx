"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Admission, Applicant, Program, AcademicYear } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, ClipboardCheck, CheckCircle, DollarSign, Search } from "lucide-react";
import { Button, Modal, FormField, Select, Input, PageHeader, LoadingSpinner, EmptyState, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function AdmissionsPage() {
  const { user } = useAuthStore();
  const canManage = user?.role === "admin" || user?.role === "admission_officer";
  const [items, setItems] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Allocate seat modal
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [allocateForm, setAllocateForm] = useState({ applicant_id: "", program_id: "", academic_year_id: "", quota_type: "KCET" });
  const [allocating, setAllocating] = useState(false);

  // Confirm & fee modals
  const [confirmTarget, setConfirmTarget] = useState<Admission | null>(null);
  const [feeTarget, setFeeTarget] = useState<Admission | null>(null);
  const [feeStatus, setFeeStatus] = useState("Pending");

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/admissions");
      setItems(res.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const [a, p, y] = await Promise.all([
        api.get("/applicants?per_page=500"),
        api.get("/programs"),
        api.get("/academic-years"),
      ]);
      setApplicants(a.data.data ?? []);
      setPrograms(p.data ?? []);
      setYears(y.data ?? []);
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAllocate = () => {
    fetchMeta().then(() => setAllocateOpen(true));
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault(); setAllocating(true);
    try {
      await api.post("/admissions/allocate", allocateForm);
      toast.success("Seat allocated successfully");
      setAllocateOpen(false); fetchData();
    } catch { /* */ } finally { setAllocating(false); }
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    try {
      await api.put(`/admissions/${confirmTarget.id}/confirm`);
      toast.success("Admission confirmed. Admission number generated.");
      setConfirmTarget(null); fetchData();
    } catch { /* */ }
  };

  const openFee = (a: Admission) => { setFeeTarget(a); setFeeStatus(a.fee_status); };
  const handleFeeUpdate = async () => {
    if (!feeTarget) return;
    try {
      await api.put(`/admissions/${feeTarget.id}/fee-status`, { fee_status: feeStatus });
      toast.success("Fee status updated");
      setFeeTarget(null); fetchData();
    } catch { /* */ }
  };

  const filtered = search
    ? items.filter((a) =>
        `${a.applicant_name} ${a.admission_number} ${a.program_name}`.toLowerCase().includes(search.toLowerCase()))
    : items;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Admissions" description="Allocate seats, confirm admissions, and track fees" action={canManage && <Button icon={<Plus className="h-4 w-4" />} onClick={openAllocate}>Allocate Seat</Button>} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input className="pl-10" placeholder="Search by name, admission #, or program..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="h-6 w-6" />} title="No Admissions" description="Allocate seats to applicants to create admission records." action={canManage && <Button icon={<Plus className="h-4 w-4" />} onClick={openAllocate}>Allocate Seat</Button>} />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Admission #</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Applicant</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Program</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Quota</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Fee</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
                  {canManage && <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-600 dark:text-indigo-400">{a.admission_number || "—"}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{a.applicant_name || "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{a.program_name || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.quota_type} /></td>
                    <td className="px-4 py-3"><StatusBadge status={a.fee_status} /></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${a.is_confirmed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                        {a.is_confirmed ? "Confirmed" : "Provisional"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(a.created_at)}</td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {!a.is_confirmed && (
                            <button onClick={() => setConfirmTarget(a)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20" title="Confirm admission">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => openFee(a)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800" title="Fee status">
                            <DollarSign className="h-4 w-4" />
                          </button>
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

      {/* Allocate Seat Modal */}
      <Modal open={allocateOpen} onClose={() => setAllocateOpen(false)} title="Allocate Seat" className="max-w-lg">
        <form onSubmit={handleAllocate} className="space-y-4">
          <FormField label="Applicant" required>
            <Select value={allocateForm.applicant_id} onChange={(e) => {
              const app = applicants.find((a) => a.id === e.target.value);
              setAllocateForm({
                ...allocateForm,
                applicant_id: e.target.value,
                program_id: app?.program_id ?? allocateForm.program_id,
                academic_year_id: app?.academic_year_id ?? allocateForm.academic_year_id,
                quota_type: app?.quota_type ?? allocateForm.quota_type,
              });
            }} required>
              <option value="">Select applicant</option>
              {applicants.filter((a) => a.status === "Applied").map((a) => (
                <option key={a.id} value={a.id}>{a.first_name} {a.last_name} ({a.application_number})</option>
              ))}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Program" required>
              <Select value={allocateForm.program_id} onChange={(e) => setAllocateForm({ ...allocateForm, program_id: e.target.value })} required>
                <option value="">Select program</option>
                {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Academic Year" required>
              <Select value={allocateForm.academic_year_id} onChange={(e) => setAllocateForm({ ...allocateForm, academic_year_id: e.target.value })} required>
                <option value="">Select year</option>
                {years.map((y) => <option key={y.id} value={y.id}>{y.name || y.year}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Quota Type" required>
            <Select value={allocateForm.quota_type} onChange={(e) => setAllocateForm({ ...allocateForm, quota_type: e.target.value })}>
              <option value="KCET">KCET</option>
              <option value="COMEDK">COMEDK</option>
              <option value="Management">Management</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setAllocateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={allocating}>Allocate Seat</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Modal */}
      <Modal open={!!confirmTarget} onClose={() => setConfirmTarget(null)} title="Confirm Admission">
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Confirm admission for <span className="font-semibold text-zinc-900 dark:text-zinc-100">{confirmTarget?.applicant_name}</span>?
            This will generate a unique admission number.
          </p>
          {confirmTarget?.fee_status !== "Paid" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              ⚠️ Fee status is &quot;{confirmTarget?.fee_status}&quot;. Fee must be Paid before confirmation.
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmTarget(null)}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </div>
        </div>
      </Modal>

      {/* Fee Modal */}
      <Modal open={!!feeTarget} onClose={() => setFeeTarget(null)} title="Update Fee Status">
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
            <Button variant="secondary" onClick={() => setFeeTarget(null)}>Cancel</Button>
            <Button onClick={handleFeeUpdate}>Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
