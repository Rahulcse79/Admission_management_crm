// ─── User & Auth Types ───────────────────────────

export type Role = "admin" | "admission_officer" | "management";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ─── Master Types ────────────────────────────────

export interface Institution {
  id: string;
  name: string;
  code: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campus {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  address: string;
  is_active: boolean;
  institution_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  campus_id: string;
  name: string;
  code: string;
  is_active: boolean;
  campus_name?: string;
  created_at: string;
  updated_at: string;
}

export type CourseType = "UG" | "PG";
export type EntryType = "Regular" | "Lateral";
export type AdmissionMode = "Government" | "Management";

export interface Program {
  id: string;
  department_id: string;
  name: string;
  code: string;
  course_type: string;
  duration_years: number;
  total_intake: number;
  entry_type?: string;
  admission_mode?: string;
  is_active: boolean;
  department_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  year?: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Seat Matrix Types ──────────────────────────

export type QuotaType = "KCET" | "COMEDK" | "Management";

export interface QuotaAllocation {
  quota_type: QuotaType;
  total_seats: number;
  filled_seats: number;
  remaining_seats: number;
}

export interface SupernumerarySeats {
  category: string;
  max_seats: number;
  used_seats: number;
}

export interface SeatMatrix {
  id: string;
  program_id: string;
  academic_year_id: string;
  total_intake: number;
  quotas: QuotaAllocation[];
  supernumerary?: SupernumerarySeats[];
  total_filled: number;
  total_remaining: number;
  is_active: boolean;
  program_name?: string;
  academic_year?: string;
  created_at: string;
  updated_at: string;
}

// ─── Applicant Types ────────────────────────────

export type Category = "GM" | "SC" | "ST" | "OBC" | "2A" | "2B" | "3A" | "3B";
export type DocStatus = "Pending" | "Submitted" | "Verified";
export type FeeStatus = "Pending" | "Paid";
export type ApplicantStatus = "Applied" | "SeatAllocated" | "Admitted" | "Rejected";

export interface Document {
  name: string;
  status: DocStatus;
}

export interface Applicant {
  id: string;
  application_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  category: Category;
  address: string;
  program_id: string;
  academic_year_id: string;
  entry_type: EntryType;
  quota_type: QuotaType;
  admission_mode: AdmissionMode;
  allotment_number?: string;
  qualifying_exam: string;
  marks: number;
  rank?: number;
  documents: Document[];
  fee_status: FeeStatus;
  status: ApplicantStatus;
  is_active: boolean;
  program_name?: string;
  academic_year?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicantRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  category: Category;
  address: string;
  program_id: string;
  academic_year_id: string;
  entry_type: EntryType;
  quota_type: QuotaType;
  admission_mode: AdmissionMode;
  allotment_number?: string;
  qualifying_exam: string;
  marks: number;
  rank?: number;
}

// ─── Admission Types ────────────────────────────

export interface Admission {
  id: string;
  admission_number: string;
  applicant_id: string;
  program_id: string;
  academic_year_id: string;
  quota_type: QuotaType;
  entry_type: EntryType;
  admission_mode: AdmissionMode;
  fee_status: FeeStatus;
  is_confirmed: boolean;
  confirmed_at?: string;
  applicant_name?: string;
  program_name?: string;
  program_code?: string;
  academic_year?: string;
  created_at: string;
  updated_at: string;
}

// ─── Dashboard Types ────────────────────────────

export interface QuotaStat {
  quota_type: QuotaType;
  total: number;
  filled: number;
  remaining: number;
}

export interface ProgramStat {
  program_id: string;
  program_name: string;
  program_code: string;
  total_intake: number;
  total_admitted: number;
  total_remaining: number;
  quotas?: QuotaStat[];
}

export interface DashboardStats {
  total_intake: number;
  total_admitted: number;
  total_pending: number;
  total_remaining: number;
  confirmed_admissions: number;
  quota_stats: QuotaStat[];
  program_stats: ProgramStat[];
  pending_documents: number;
  pending_fees: number;
  recent_admissions: Admission[];
}
