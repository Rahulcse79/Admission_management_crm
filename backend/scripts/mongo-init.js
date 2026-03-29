// Admission CRM MongoDB Initialization Script
// This runs when the MongoDB container is first created

db = db.getSiblingDB('admission_crm');

// Create collections with validation
db.createCollection('users');
db.createCollection('institutions');
db.createCollection('campuses');
db.createCollection('departments');
db.createCollection('programs');
db.createCollection('academic_years');
db.createCollection('seat_matrices');
db.createCollection('applicants');
db.createCollection('admissions');

// ─── Indexes ─────────────────────────────────────

// Users
db.users.createIndex({ "email": 1 }, { unique: true });

// Institutions
db.institutions.createIndex({ "code": 1 }, { unique: true });

// Campuses
db.campuses.createIndex({ "institution_id": 1 });
db.campuses.createIndex({ "code": 1 }, { unique: true });

// Departments
db.departments.createIndex({ "campus_id": 1 });
db.departments.createIndex({ "code": 1 }, { unique: true });

// Programs
db.programs.createIndex({ "department_id": 1 });
db.programs.createIndex({ "code": 1 }, { unique: true });

// Academic Years
db.academic_years.createIndex({ "year": 1 }, { unique: true });

// Seat Matrices
db.seat_matrices.createIndex({ "program_id": 1, "academic_year_id": 1 }, { unique: true });

// Applicants
db.applicants.createIndex({ "application_number": 1 }, { unique: true });
db.applicants.createIndex({ "email": 1 });
db.applicants.createIndex({ "quota_type": 1 });
db.applicants.createIndex({ "program_id": 1 });

// Admissions
db.admissions.createIndex({ "admission_number": 1 }, { unique: true });
db.admissions.createIndex({ "applicant_id": 1 }, { unique: true });
db.admissions.createIndex({ "program_id": 1, "quota_type": 1 });

print('✅ MongoDB initialized with collections and indexes');
