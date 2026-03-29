package services

import (
	"context"

	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"github.com/rahulsingh/admission-crm-backend/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MasterService struct {
	repos *repository.Repositories
}

func NewMasterService(repos *repository.Repositories) *MasterService {
	return &MasterService{repos: repos}
}

// ─── Institution ─────────────────────────────────

func (s *MasterService) CreateInstitution(ctx context.Context, inst *models.Institution) error {
	return s.repos.Institution.Create(ctx, inst)
}

func (s *MasterService) GetAllInstitutions(ctx context.Context) ([]models.Institution, error) {
	return s.repos.Institution.FindAll(ctx)
}

func (s *MasterService) GetInstitution(ctx context.Context, id string) (*models.Institution, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return s.repos.Institution.FindByID(ctx, objID)
}

func (s *MasterService) UpdateInstitution(ctx context.Context, id string, inst *models.Institution) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Institution.Update(ctx, objID, inst)
}

func (s *MasterService) DeleteInstitution(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Institution.Delete(ctx, objID)
}

// ─── Campus ──────────────────────────────────────

func (s *MasterService) CreateCampus(ctx context.Context, campus *models.Campus) error {
	return s.repos.Campus.Create(ctx, campus)
}

func (s *MasterService) GetAllCampuses(ctx context.Context) ([]models.Campus, error) {
	campuses, err := s.repos.Campus.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	// Populate institution names
	for i := range campuses {
		inst, err := s.repos.Institution.FindByID(ctx, campuses[i].InstitutionID)
		if err == nil {
			campuses[i].InstitutionName = inst.Name
		}
	}
	return campuses, nil
}

func (s *MasterService) GetCampusesByInstitution(ctx context.Context, instID string) ([]models.Campus, error) {
	objID, err := primitive.ObjectIDFromHex(instID)
	if err != nil {
		return nil, err
	}
	return s.repos.Campus.FindByInstitution(ctx, objID)
}

func (s *MasterService) GetCampus(ctx context.Context, id string) (*models.Campus, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return s.repos.Campus.FindByID(ctx, objID)
}

func (s *MasterService) UpdateCampus(ctx context.Context, id string, campus *models.Campus) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Campus.Update(ctx, objID, campus)
}

func (s *MasterService) DeleteCampus(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Campus.Delete(ctx, objID)
}

// ─── Department ──────────────────────────────────

func (s *MasterService) CreateDepartment(ctx context.Context, dept *models.Department) error {
	return s.repos.Department.Create(ctx, dept)
}

func (s *MasterService) GetAllDepartments(ctx context.Context) ([]models.Department, error) {
	depts, err := s.repos.Department.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	for i := range depts {
		campus, err := s.repos.Campus.FindByID(ctx, depts[i].CampusID)
		if err == nil {
			depts[i].CampusName = campus.Name
		}
	}
	return depts, nil
}

func (s *MasterService) GetDepartmentsByCampus(ctx context.Context, campusID string) ([]models.Department, error) {
	objID, err := primitive.ObjectIDFromHex(campusID)
	if err != nil {
		return nil, err
	}
	return s.repos.Department.FindByCampus(ctx, objID)
}

func (s *MasterService) GetDepartment(ctx context.Context, id string) (*models.Department, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return s.repos.Department.FindByID(ctx, objID)
}

func (s *MasterService) UpdateDepartment(ctx context.Context, id string, dept *models.Department) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Department.Update(ctx, objID, dept)
}

func (s *MasterService) DeleteDepartment(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Department.Delete(ctx, objID)
}

// ─── Program ─────────────────────────────────────

func (s *MasterService) CreateProgram(ctx context.Context, prog *models.Program) error {
	return s.repos.Program.Create(ctx, prog)
}

func (s *MasterService) GetAllPrograms(ctx context.Context) ([]models.Program, error) {
	progs, err := s.repos.Program.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	for i := range progs {
		dept, err := s.repos.Department.FindByID(ctx, progs[i].DepartmentID)
		if err == nil {
			progs[i].DepartmentName = dept.Name
		}
	}
	return progs, nil
}

func (s *MasterService) GetProgramsByDepartment(ctx context.Context, deptID string) ([]models.Program, error) {
	objID, err := primitive.ObjectIDFromHex(deptID)
	if err != nil {
		return nil, err
	}
	return s.repos.Program.FindByDepartment(ctx, objID)
}

func (s *MasterService) GetProgram(ctx context.Context, id string) (*models.Program, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return s.repos.Program.FindByID(ctx, objID)
}

func (s *MasterService) UpdateProgram(ctx context.Context, id string, prog *models.Program) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Program.Update(ctx, objID, prog)
}

func (s *MasterService) DeleteProgram(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.Program.Delete(ctx, objID)
}

// ─── Academic Year ───────────────────────────────

func (s *MasterService) CreateAcademicYear(ctx context.Context, ay *models.AcademicYear) error {
	return s.repos.AcademicYear.Create(ctx, ay)
}

func (s *MasterService) GetAllAcademicYears(ctx context.Context) ([]models.AcademicYear, error) {
	return s.repos.AcademicYear.FindAll(ctx)
}

func (s *MasterService) GetCurrentAcademicYear(ctx context.Context) (*models.AcademicYear, error) {
	return s.repos.AcademicYear.FindCurrent(ctx)
}

func (s *MasterService) UpdateAcademicYear(ctx context.Context, id string, ay *models.AcademicYear) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.AcademicYear.Update(ctx, objID, ay)
}

func (s *MasterService) SetCurrentAcademicYear(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.repos.AcademicYear.SetCurrent(ctx, objID)
}
