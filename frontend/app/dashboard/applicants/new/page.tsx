"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Program, AcademicYear } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { ArrowLeft, UserPlus } from "lucide-react";
import {
  Button,
  FormField,
  Input,
  Select,
  PageHeader,
  LoadingSpinner,
} from "@/components/ui";

const CATEGORIES = ["GM", "SC", "ST", "OBC", "2A", "2B", "3A", "3B"] as const;
const QUOTA_TYPES = ["KCET", "COMEDK", "Management"] as const;

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "Male",
  category: "GM" as string,
  address: "",
  program_id: "",
  academic_year_id: "",
  entry_type: "Regular",
  quota_type: "KCET" as string,
  admission_mode: "KCET",
  allotment_number: "",
  qualifying_exam: "",
  marks: 0,
  rank: 0,
};

export default function NewApplicantPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canCreate = user?.role === "admin" || user?.role === "admission_officer";

  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchMeta = useCallback(async () => {
    try {
      const [p, y] = await Promise.all([
        api.get("/programs"),
        api.get("/academic-years"),
      ]);
      const programsList = p.data ?? [];
      const yearsList = y.data ?? [];
      setPrograms(programsList);
      setYears(yearsList);

      // Pre-select defaults
      const currentYear = yearsList.find((yr: AcademicYear) => yr.is_current);
      setForm((prev) => ({
        ...prev,
        program_id: programsList[0]?.id ?? "",
        academic_year_id: currentYear?.id ?? yearsList[0]?.id ?? "",
      }));
    } catch {
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (user && !canCreate) {
      router.replace("/dashboard/applicants");
    }
  }, [user, canCreate, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      marks: Number(form.marks),
      rank: Number(form.rank) || undefined,
    };
    try {
      await api.post("/applicants", payload);
      toast.success("Applicant created successfully");
      router.push("/dashboard/applicants");
    } catch {
      toast.error("Failed to create applicant");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!canCreate) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Applicant"
        description="Fill in the details to register a new applicant"
        action={
          <Button
            variant="secondary"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push("/dashboard/applicants")}
          >
            Back to Applicants
          </Button>
        }
      />

      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          {/* ── Personal Information ── */}
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="First Name" required>
                <Input
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  placeholder="Enter first name"
                  required
                />
              </FormField>
              <FormField label="Last Name" required>
                <Input
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  placeholder="Enter last name"
                  required
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Email" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="applicant@example.com"
                  required
                />
              </FormField>
              <FormField label="Phone" required>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  required
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Date of Birth" required>
                <Input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) =>
                    setForm({ ...form, date_of_birth: e.target.value })
                  }
                  required
                />
              </FormField>
              <FormField label="Gender" required>
                <Select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </FormField>
              <FormField label="Category" required>
                <Select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <FormField label="Address">
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="Full address"
              />
            </FormField>
          </div>

          {/* ── Academic Information ── */}
          <h3 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Academic Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Program" required>
                <Select
                  value={form.program_id}
                  onChange={(e) =>
                    setForm({ ...form, program_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Academic Year" required>
                <Select
                  value={form.academic_year_id}
                  onChange={(e) =>
                    setForm({ ...form, academic_year_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select year</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name || y.year}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Entry Type">
                <Select
                  value={form.entry_type}
                  onChange={(e) =>
                    setForm({ ...form, entry_type: e.target.value })
                  }
                >
                  <option value="Regular">Regular</option>
                  <option value="Lateral">Lateral</option>
                </Select>
              </FormField>
              <FormField label="Quota Type" required>
                <Select
                  value={form.quota_type}
                  onChange={(e) =>
                    setForm({ ...form, quota_type: e.target.value })
                  }
                >
                  {QUOTA_TYPES.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Allotment #">
                <Input
                  value={form.allotment_number}
                  onChange={(e) =>
                    setForm({ ...form, allotment_number: e.target.value })
                  }
                  placeholder="e.g. ALT-001"
                />
              </FormField>
            </div>
          </div>

          {/* ── Exam Details ── */}
          <h3 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Exam Details
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Qualifying Exam" required>
                <Input
                  value={form.qualifying_exam}
                  onChange={(e) =>
                    setForm({ ...form, qualifying_exam: e.target.value })
                  }
                  placeholder="e.g. CET 2026"
                  required
                />
              </FormField>
              <FormField label="Marks" required>
                <Input
                  type="number"
                  step="0.01"
                  value={form.marks}
                  onChange={(e) =>
                    setForm({ ...form, marks: Number(e.target.value) })
                  }
                  required
                />
              </FormField>
              <FormField label="Rank">
                <Input
                  type="number"
                  value={form.rank}
                  onChange={(e) =>
                    setForm({ ...form, rank: Number(e.target.value) })
                  }
                  placeholder="Optional"
                />
              </FormField>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/dashboard/applicants")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              icon={<UserPlus className="h-4 w-4" />}
            >
              Create Applicant
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
