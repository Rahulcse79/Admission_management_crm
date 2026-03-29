package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/rahulsingh/admission-crm-backend/internal/config"
	"github.com/rahulsingh/admission-crm-backend/internal/database"
	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("❌ Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		database.Disconnect(ctx)
	}()

	ctx := context.Background()

	log.Println("🗑️  Clearing existing data...")
	collections := []string{"users", "institutions", "campuses", "departments", "programs", "academic_years", "seat_matrices", "applicants", "admissions"}
	for _, col := range collections {
		db.Collection(col).DeleteMany(ctx, bson.M{})
	}
	log.Println("✅ Cleared all collections")

	// ═══════════════════════════════════════════════
	// 1. USERS
	// ═══════════════════════════════════════════════
	log.Println("\n👤 Seeding users...")
	seedUsers(ctx, db, cfg)

	// ═══════════════════════════════════════════════
	// 2. ACADEMIC YEAR
	// ═══════════════════════════════════════════════
	log.Println("\n📅 Seeding academic years...")
	ay2526 := seedAcademicYear(ctx, db, "2025-26", time.Date(2025, 6, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 5, 31, 0, 0, 0, 0, time.UTC), false)
	ay2627 := seedAcademicYear(ctx, db, "2026-27", time.Date(2026, 6, 1, 0, 0, 0, 0, time.UTC), time.Date(2027, 5, 31, 0, 0, 0, 0, time.UTC), true)

	// ═══════════════════════════════════════════════
	// 3. INSTITUTION
	// ═══════════════════════════════════════════════
	log.Println("\n🏛️  Seeding institutions...")
	inst1 := seedInstitution(ctx, db, "EduMerge University", "EMU", "123 University Road, Bangalore", "080-12345678", "admin@edumerge.edu", "https://edumerge.edu")
	inst2 := seedInstitution(ctx, db, "National Institute of Engineering", "NIE", "Mysore Road, Mysore", "0821-9876543", "admin@nie.ac.in", "https://nie.ac.in")

	// ═══════════════════════════════════════════════
	// 4. CAMPUSES
	// ═══════════════════════════════════════════════
	log.Println("\n🏫 Seeding campuses...")
	campus1 := seedCampus(ctx, db, inst1, "Main Campus", "EMU-MC", "University Road, Bangalore 560001")
	campus2 := seedCampus(ctx, db, inst1, "North Campus", "EMU-NC", "Hebbal, Bangalore 560024")
	campus3 := seedCampus(ctx, db, inst2, "NIE Main Campus", "NIE-MC", "Mananthavady Road, Mysore 570008")

	// ═══════════════════════════════════════════════
	// 5. DEPARTMENTS
	// ═══════════════════════════════════════════════
	log.Println("\n📚 Seeding departments...")
	deptCSE := seedDepartment(ctx, db, campus1, "Computer Science & Engineering", "CSE")
	deptECE := seedDepartment(ctx, db, campus1, "Electronics & Communication", "ECE")
	deptME := seedDepartment(ctx, db, campus1, "Mechanical Engineering", "ME")
	deptIS := seedDepartment(ctx, db, campus2, "Information Science", "IS")
	deptCV := seedDepartment(ctx, db, campus2, "Civil Engineering", "CV")
	deptCSE2 := seedDepartment(ctx, db, campus3, "Computer Science", "CSE-NIE")
	deptEEE := seedDepartment(ctx, db, campus3, "Electrical & Electronics", "EEE")

	// ═══════════════════════════════════════════════
	// 6. PROGRAMS
	// ═══════════════════════════════════════════════
	log.Println("\n🎓 Seeding programs...")
	progCSE := seedProgram(ctx, db, deptCSE, "B.Tech Computer Science & Engineering", "BTCSE", models.CourseTypeUG, 4)
	progECE := seedProgram(ctx, db, deptECE, "B.Tech Electronics & Communication", "BTECE", models.CourseTypeUG, 4)
	progME := seedProgram(ctx, db, deptME, "B.Tech Mechanical Engineering", "BTME", models.CourseTypeUG, 4)
	progIS := seedProgram(ctx, db, deptIS, "B.Tech Information Science", "BTIS", models.CourseTypeUG, 4)
	progCV := seedProgram(ctx, db, deptCV, "B.Tech Civil Engineering", "BTCV", models.CourseTypeUG, 4)
	progCSE2 := seedProgram(ctx, db, deptCSE2, "B.Tech CS (NIE)", "BTCSN", models.CourseTypeUG, 4)
	progEEE := seedProgram(ctx, db, deptEEE, "B.Tech Electrical & Electronics", "BTEEE", models.CourseTypeUG, 4)
	progMTechCSE := seedProgram(ctx, db, deptCSE, "M.Tech Computer Science", "MTCSE", models.CourseTypePG, 2)
	progMTechECE := seedProgram(ctx, db, deptECE, "M.Tech VLSI Design", "MTVLSI", models.CourseTypePG, 2)

	allPrograms := []primitive.ObjectID{progCSE, progECE, progME, progIS, progCV, progCSE2, progEEE, progMTechCSE, progMTechECE}
	intakes := []int{120, 60, 60, 60, 60, 60, 60, 30, 20}

	// ═══════════════════════════════════════════════
	// 7. SEAT MATRIX
	// ═══════════════════════════════════════════════
	log.Println("\n💺 Seeding seat matrices...")
	for i, progID := range allPrograms {
		seedSeatMatrix(ctx, db, progID, ay2627, intakes[i])
	}
	// Also seed last year for history
	seedSeatMatrix(ctx, db, progCSE, ay2526, 120)
	seedSeatMatrix(ctx, db, progECE, ay2526, 60)

	// ═══════════════════════════════════════════════
	// 8. APPLICANTS & ADMISSIONS
	// ═══════════════════════════════════════════════
	log.Println("\n📝 Seeding applicants & admissions...")
	seedApplicantsAndAdmissions(ctx, db, allPrograms, intakes, ay2627)

	log.Println("\n🎉 ═══════════════════════════════════════")
	log.Println("   SEEDING COMPLETED SUCCESSFULLY!")
	log.Println("═══════════════════════════════════════════")
	log.Println("\n📊 Summary:")
	log.Println("   • 2 Institutions")
	log.Println("   • 3 Campuses")
	log.Println("   • 7 Departments")
	log.Println("   • 9 Programs (7 UG + 2 PG)")
	log.Println("   • 2 Academic Years (2025-26, 2026-27)")
	log.Println("   • 11 Seat Matrices")
	log.Println("   • ~200+ Applicants with various statuses")
	log.Println("   • Admissions with fee/document statuses")
	log.Println("\n🔑 Login Credentials:")
	log.Printf("   Admin:   %s / %s\n", cfg.AdminEmail, cfg.AdminPassword)
	log.Println("   Officer: officer@edumerge.com / Officer@123")
	log.Println("   Mgmt:    management@edumerge.com / Mgmt@123")
}

// ─── Helper Functions ─────────────────────────────

func seedUsers(ctx context.Context, db *mongo.Database, cfg *config.Config) {
	users := []struct {
		name     string
		email    string
		password string
		role     models.Role
	}{
		{"System Administrator", cfg.AdminEmail, cfg.AdminPassword, models.RoleAdmin},
		{"Admission Officer", "officer@edumerge.com", "Officer@123", models.RoleAdmissionOfficer},
		{"Management Viewer", "management@edumerge.com", "Mgmt@123", models.RoleManagement},
	}

	for _, u := range users {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(u.password), bcrypt.DefaultCost)
		doc := models.User{
			ID:        primitive.NewObjectID(),
			Name:      u.name,
			Email:     u.email,
			Password:  string(hashed),
			Role:      u.role,
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		db.Collection("users").InsertOne(ctx, doc)
		log.Printf("   ✅ User: %s (%s)", u.name, u.role)
	}
}

func seedAcademicYear(ctx context.Context, db *mongo.Database, year string, start, end time.Time, isCurrent bool) primitive.ObjectID {
	id := primitive.NewObjectID()
	doc := models.AcademicYear{
		ID:        id,
		Year:      year,
		StartDate: start,
		EndDate:   end,
		IsCurrent: isCurrent,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Collection("academic_years").InsertOne(ctx, doc)
	marker := "  "
	if isCurrent {
		marker = "⭐"
	}
	log.Printf("   %s %s (current: %v)", marker, year, isCurrent)
	return id
}

func seedInstitution(ctx context.Context, db *mongo.Database, name, code, address, phone, email, website string) primitive.ObjectID {
	id := primitive.NewObjectID()
	doc := models.Institution{
		ID:        id,
		Name:      name,
		Code:      code,
		Address:   address,
		Phone:     phone,
		Email:     email,
		Website:   website,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Collection("institutions").InsertOne(ctx, doc)
	log.Printf("   ✅ %s [%s]", name, code)
	return id
}

func seedCampus(ctx context.Context, db *mongo.Database, instID primitive.ObjectID, name, code, address string) primitive.ObjectID {
	id := primitive.NewObjectID()
	doc := models.Campus{
		ID:            id,
		InstitutionID: instID,
		Name:          name,
		Code:          code,
		Address:       address,
		IsActive:      true,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	db.Collection("campuses").InsertOne(ctx, doc)
	log.Printf("   ✅ %s [%s]", name, code)
	return id
}

func seedDepartment(ctx context.Context, db *mongo.Database, campusID primitive.ObjectID, name, code string) primitive.ObjectID {
	id := primitive.NewObjectID()
	doc := models.Department{
		ID:        id,
		CampusID:  campusID,
		Name:      name,
		Code:      code,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Collection("departments").InsertOne(ctx, doc)
	log.Printf("   ✅ %s [%s]", name, code)
	return id
}

func seedProgram(ctx context.Context, db *mongo.Database, deptID primitive.ObjectID, name, code string, courseType models.CourseType, duration int) primitive.ObjectID {
	id := primitive.NewObjectID()
	doc := models.Program{
		ID:           id,
		DepartmentID: deptID,
		Name:         name,
		Code:         code,
		CourseType:   courseType,
		Duration:     duration,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	db.Collection("programs").InsertOne(ctx, doc)
	log.Printf("   ✅ %s [%s] (%s, %dy)", name, code, courseType, duration)
	return id
}

func seedSeatMatrix(ctx context.Context, db *mongo.Database, programID, ayID primitive.ObjectID, totalIntake int) {
	// Split intake: ~40% KCET, ~35% COMEDK, ~25% Management
	kcetSeats := int(float64(totalIntake) * 0.40)
	comedkSeats := int(float64(totalIntake) * 0.35)
	mgmtSeats := totalIntake - kcetSeats - comedkSeats

	// Simulate partial filling
	kcetFilled := int(float64(kcetSeats) * (0.5 + rand.Float64()*0.45))
	comedkFilled := int(float64(comedkSeats) * (0.3 + rand.Float64()*0.5))
	mgmtFilled := int(float64(mgmtSeats) * (0.2 + rand.Float64()*0.5))

	totalFilled := kcetFilled + comedkFilled + mgmtFilled

	id := primitive.NewObjectID()
	doc := models.SeatMatrix{
		ID:             id,
		ProgramID:      programID,
		AcademicYearID: ayID,
		TotalIntake:    totalIntake,
		Quotas: []models.QuotaAllocation{
			{QuotaType: models.QuotaKCET, TotalSeats: kcetSeats, FilledSeats: kcetFilled, RemainingSeats: kcetSeats - kcetFilled},
			{QuotaType: models.QuotaCOMEDK, TotalSeats: comedkSeats, FilledSeats: comedkFilled, RemainingSeats: comedkSeats - comedkFilled},
			{QuotaType: models.QuotaManagement, TotalSeats: mgmtSeats, FilledSeats: mgmtFilled, RemainingSeats: mgmtSeats - mgmtFilled},
		},
		Supernumerary: []models.SupernumerarySeats{
			{Category: "J&K", MaxSeats: 2, UsedSeats: rand.Intn(2)},
			{Category: "Foreign", MaxSeats: 3, UsedSeats: rand.Intn(3)},
		},
		TotalFilled:    totalFilled,
		TotalRemaining: totalIntake - totalFilled,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	db.Collection("seat_matrices").InsertOne(ctx, doc)
	log.Printf("   ✅ Seat Matrix: intake=%d, filled=%d, remaining=%d", totalIntake, totalFilled, totalIntake-totalFilled)
}

func seedApplicantsAndAdmissions(ctx context.Context, db *mongo.Database, programs []primitive.ObjectID, intakes []int, ayID primitive.ObjectID) {
	firstNames := []string{"Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
		"Ananya", "Diya", "Myra", "Aadhya", "Pihu", "Prisha", "Anika", "Sara", "Navya", "Aanya",
		"Rohit", "Amit", "Sneha", "Pooja", "Rahul", "Priya", "Deepak", "Kavitha", "Suresh", "Lakshmi",
		"Nikhil", "Tanvi", "Harsh", "Megha", "Karthik", "Divya", "Varun", "Anjali", "Pranav", "Shruti",
		"Ravi", "Neha", "Akash", "Pallavi", "Gaurav", "Swati", "Manish", "Rashmi", "Sanjay", "Meera"}
	lastNames := []string{"Sharma", "Patel", "Kumar", "Singh", "Reddy", "Rao", "Gupta", "Verma", "Joshi", "Nair",
		"Iyer", "Bhat", "Hegde", "Shetty", "Gowda", "Menon", "Pillai", "Das", "Mishra", "Tiwari",
		"Chauhan", "Yadav", "Thakur", "Saxena", "Jain", "Agarwal", "Bansal", "Khanna", "Kapoor", "Malhotra"}
	genders := []string{"Male", "Female"}
	categories := []models.Category{models.CategoryGM, models.CategorySC, models.CategoryST, models.CategoryOBC, models.Category2A, models.Category2B, models.Category3A, models.Category3B}
	quotaTypes := []models.QuotaType{models.QuotaKCET, models.QuotaCOMEDK, models.QuotaManagement}
	entryTypes := []models.EntryType{models.EntryTypeRegular, models.EntryTypeLateral}
	admissionModes := []models.AdmissionMode{models.AdmissionModeGovernment, models.AdmissionModeManagement}
	statuses := []string{"Applied", "SeatAllocated", "Admitted", "Rejected"}
	statusWeights := []int{25, 20, 45, 10} // weighted distribution
	exams := []string{"KCET-2026", "COMEDK-2026", "JEE Main 2026", "GATE 2026"}

	documents := []string{"10th Marksheet", "12th Marksheet", "Transfer Certificate", "Migration Certificate", "Aadhar Card", "Category Certificate"}
	docStatuses := []models.DocStatus{models.DocStatusPending, models.DocStatusSubmitted, models.DocStatusVerified}

	appNum := 1000
	admNum := 5000
	totalApplicants := 0
	totalAdmissions := 0

	for pi, progID := range programs {
		// Generate applicants proportional to intake (1.5x - 2x the intake)
		numApplicants := int(float64(intakes[pi]) * (1.5 + rand.Float64()*0.5))

		for i := 0; i < numApplicants; i++ {
			appNum++
			firstName := firstNames[rand.Intn(len(firstNames))]
			lastName := lastNames[rand.Intn(len(lastNames))]
			gender := genders[rand.Intn(len(genders))]
			category := categories[rand.Intn(len(categories))]
			quotaType := quotaTypes[rand.Intn(len(quotaTypes))]
			entryType := entryTypes[0] // mostly regular
			if rand.Float64() < 0.1 {
				entryType = entryTypes[1] // 10% lateral
			}
			admMode := admissionModes[0]
			if quotaType == models.QuotaManagement {
				admMode = admissionModes[1]
			}

			// Weighted random status
			status := weightedRandom(statuses, statusWeights)
			marks := 50.0 + rand.Float64()*50.0 // 50-100
			rank := rand.Intn(50000) + 1

			// Generate documents with varying statuses
			var docs []models.Document
			for _, docName := range documents {
				ds := docStatuses[2] // default verified
				if status == "Applied" {
					ds = docStatuses[rand.Intn(3)]
				} else if status == "SeatAllocated" {
					ds = docStatuses[1+rand.Intn(2)] // submitted or verified
				}
				docs = append(docs, models.Document{Name: docName, Status: ds})
			}

			feeStatus := models.FeeStatusPending
			if status == "Admitted" {
				feeStatus = models.FeeStatusPaid
			} else if status == "SeatAllocated" && rand.Float64() > 0.5 {
				feeStatus = models.FeeStatusPaid
			}

			dob := time.Date(2004+rand.Intn(4), time.Month(1+rand.Intn(12)), 1+rand.Intn(28), 0, 0, 0, 0, time.UTC)
			createdAt := time.Now().AddDate(0, 0, -rand.Intn(60)) // random date in last 60 days

			applicantID := primitive.NewObjectID()
			applicant := models.Applicant{
				ID:                applicantID,
				ApplicationNumber: fmt.Sprintf("APP-%d", appNum),
				FirstName:         firstName,
				LastName:          lastName,
				Email:             fmt.Sprintf("%s.%s%d@example.com", firstName, lastName, rand.Intn(100)),
				Phone:             fmt.Sprintf("9%09d", rand.Intn(1000000000)),
				DateOfBirth:       dob,
				Gender:            gender,
				Category:          category,
				Address:           fmt.Sprintf("%d, Sector %d, Bangalore 5600%02d", rand.Intn(200)+1, rand.Intn(50)+1, rand.Intn(99)),
				ProgramID:         progID,
				AcademicYearID:    ayID,
				EntryType:         entryType,
				QuotaType:         quotaType,
				AdmissionMode:     admMode,
				QualifyingExam:    exams[rand.Intn(len(exams))],
				Marks:             float64(int(marks*100)) / 100,
				Rank:              rank,
				Documents:         docs,
				FeeStatus:         feeStatus,
				Status:            status,
				IsActive:          true,
				CreatedAt:         createdAt,
				UpdatedAt:         createdAt,
			}

			if quotaType == models.QuotaKCET {
				applicant.AllotmentNumber = fmt.Sprintf("KCET-%d", 100000+rand.Intn(900000))
			} else if quotaType == models.QuotaCOMEDK {
				applicant.AllotmentNumber = fmt.Sprintf("CMK-%d", 100000+rand.Intn(900000))
			}

			db.Collection("applicants").InsertOne(ctx, applicant)
			totalApplicants++

			// Create admission record for allocated/admitted applicants
			if status == "SeatAllocated" || status == "Admitted" {
				admNum++
				confirmedAt := createdAt.Add(time.Duration(rand.Intn(72)) * time.Hour)
				admission := models.Admission{
					ID:              primitive.NewObjectID(),
					AdmissionNumber: fmt.Sprintf("ADM-%d", admNum),
					ApplicantID:     applicantID,
					ProgramID:       progID,
					AcademicYearID:  ayID,
					QuotaType:       quotaType,
					EntryType:       entryType,
					AdmissionMode:   admMode,
					FeeStatus:       feeStatus,
					IsConfirmed:     status == "Admitted",
					CreatedAt:       createdAt,
					UpdatedAt:       confirmedAt,
				}
				if status == "Admitted" {
					admission.ConfirmedAt = &confirmedAt
				}
				db.Collection("admissions").InsertOne(ctx, admission)
				totalAdmissions++
			}
		}
	}

	log.Printf("   ✅ Created %d applicants", totalApplicants)
	log.Printf("   ✅ Created %d admissions", totalAdmissions)
}

func weightedRandom(items []string, weights []int) string {
	total := 0
	for _, w := range weights {
		total += w
	}
	r := rand.Intn(total)
	cumulative := 0
	for i, w := range weights {
		cumulative += w
		if r < cumulative {
			return items[i]
		}
	}
	return items[len(items)-1]
}
