package repository

import "go.mongodb.org/mongo-driver/mongo"

// Repositories holds all repository instances
type Repositories struct {
	User         *UserRepository
	Institution  *InstitutionRepository
	Campus       *CampusRepository
	Department   *DepartmentRepository
	Program      *ProgramRepository
	AcademicYear *AcademicYearRepository
	SeatMatrix   *SeatMatrixRepository
	Applicant    *ApplicantRepository
	Admission    *AdmissionRepository
}

// NewRepositories initializes all repositories
func NewRepositories(db *mongo.Database) *Repositories {
	return &Repositories{
		User:         NewUserRepository(db),
		Institution:  NewInstitutionRepository(db),
		Campus:       NewCampusRepository(db),
		Department:   NewDepartmentRepository(db),
		Program:      NewProgramRepository(db),
		AcademicYear: NewAcademicYearRepository(db),
		SeatMatrix:   NewSeatMatrixRepository(db),
		Applicant:    NewApplicantRepository(db),
		Admission:    NewAdmissionRepository(db),
	}
}
