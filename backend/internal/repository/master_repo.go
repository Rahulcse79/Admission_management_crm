package repository

import (
	"context"
	"time"

	"github.com/rahulsingh/admission-crm-backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ─── Institution Repository ─────────────────────

type InstitutionRepository struct {
	collection *mongo.Collection
}

func NewInstitutionRepository(db *mongo.Database) *InstitutionRepository {
	return &InstitutionRepository{collection: db.Collection("institutions")}
}

func (r *InstitutionRepository) Create(ctx context.Context, inst *models.Institution) error {
	inst.CreatedAt = time.Now()
	inst.UpdatedAt = time.Now()
	inst.IsActive = true
	if inst.ID.IsZero() {
		inst.ID = primitive.NewObjectID()
	}
	_, err := r.collection.InsertOne(ctx, inst)
	return err
}

func (r *InstitutionRepository) FindAll(ctx context.Context) ([]models.Institution, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"is_active": true}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Institution
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *InstitutionRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Institution, error) {
	var item models.Institution
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *InstitutionRepository) Update(ctx context.Context, id primitive.ObjectID, inst *models.Institution) error {
	inst.UpdatedAt = time.Now()
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": inst})
	return err
}

func (r *InstitutionRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"is_active": false, "updated_at": time.Now()}})
	return err
}

// ─── Campus Repository ──────────────────────────

type CampusRepository struct {
	collection *mongo.Collection
}

func NewCampusRepository(db *mongo.Database) *CampusRepository {
	return &CampusRepository{collection: db.Collection("campuses")}
}

func (r *CampusRepository) Create(ctx context.Context, campus *models.Campus) error {
	campus.CreatedAt = time.Now()
	campus.UpdatedAt = time.Now()
	campus.IsActive = true
	if campus.ID.IsZero() {
		campus.ID = primitive.NewObjectID()
	}
	_, err := r.collection.InsertOne(ctx, campus)
	return err
}

func (r *CampusRepository) FindAll(ctx context.Context) ([]models.Campus, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"is_active": true}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Campus
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *CampusRepository) FindByInstitution(ctx context.Context, instID primitive.ObjectID) ([]models.Campus, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"institution_id": instID, "is_active": true})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Campus
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *CampusRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Campus, error) {
	var item models.Campus
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *CampusRepository) Update(ctx context.Context, id primitive.ObjectID, campus *models.Campus) error {
	campus.UpdatedAt = time.Now()
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": campus})
	return err
}

func (r *CampusRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"is_active": false, "updated_at": time.Now()}})
	return err
}

// ─── Department Repository ──────────────────────

type DepartmentRepository struct {
	collection *mongo.Collection
}

func NewDepartmentRepository(db *mongo.Database) *DepartmentRepository {
	return &DepartmentRepository{collection: db.Collection("departments")}
}

func (r *DepartmentRepository) Create(ctx context.Context, dept *models.Department) error {
	dept.CreatedAt = time.Now()
	dept.UpdatedAt = time.Now()
	dept.IsActive = true
	if dept.ID.IsZero() {
		dept.ID = primitive.NewObjectID()
	}
	_, err := r.collection.InsertOne(ctx, dept)
	return err
}

func (r *DepartmentRepository) FindAll(ctx context.Context) ([]models.Department, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"is_active": true}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Department
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *DepartmentRepository) FindByCampus(ctx context.Context, campusID primitive.ObjectID) ([]models.Department, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"campus_id": campusID, "is_active": true})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Department
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *DepartmentRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Department, error) {
	var item models.Department
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *DepartmentRepository) Update(ctx context.Context, id primitive.ObjectID, dept *models.Department) error {
	dept.UpdatedAt = time.Now()
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": dept})
	return err
}

func (r *DepartmentRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"is_active": false, "updated_at": time.Now()}})
	return err
}

// ─── Program Repository ─────────────────────────

type ProgramRepository struct {
	collection *mongo.Collection
}

func NewProgramRepository(db *mongo.Database) *ProgramRepository {
	return &ProgramRepository{collection: db.Collection("programs")}
}

func (r *ProgramRepository) Create(ctx context.Context, prog *models.Program) error {
	prog.CreatedAt = time.Now()
	prog.UpdatedAt = time.Now()
	prog.IsActive = true
	if prog.ID.IsZero() {
		prog.ID = primitive.NewObjectID()
	}
	_, err := r.collection.InsertOne(ctx, prog)
	return err
}

func (r *ProgramRepository) FindAll(ctx context.Context) ([]models.Program, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"is_active": true}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Program
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *ProgramRepository) FindByDepartment(ctx context.Context, deptID primitive.ObjectID) ([]models.Program, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"department_id": deptID, "is_active": true})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Program
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *ProgramRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Program, error) {
	var item models.Program
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ProgramRepository) Update(ctx context.Context, id primitive.ObjectID, prog *models.Program) error {
	prog.UpdatedAt = time.Now()
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": prog})
	return err
}

func (r *ProgramRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"is_active": false, "updated_at": time.Now()}})
	return err
}

// ─── Academic Year Repository ───────────────────

type AcademicYearRepository struct {
	collection *mongo.Collection
}

func NewAcademicYearRepository(db *mongo.Database) *AcademicYearRepository {
	return &AcademicYearRepository{collection: db.Collection("academic_years")}
}

func (r *AcademicYearRepository) Create(ctx context.Context, ay *models.AcademicYear) error {
	ay.CreatedAt = time.Now()
	ay.UpdatedAt = time.Now()
	ay.IsActive = true
	if ay.ID.IsZero() {
		ay.ID = primitive.NewObjectID()
	}
	_, err := r.collection.InsertOne(ctx, ay)
	return err
}

func (r *AcademicYearRepository) FindAll(ctx context.Context) ([]models.AcademicYear, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"is_active": true}, options.Find().SetSort(bson.D{{Key: "year", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.AcademicYear
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *AcademicYearRepository) FindCurrent(ctx context.Context) (*models.AcademicYear, error) {
	var item models.AcademicYear
	err := r.collection.FindOne(ctx, bson.M{"is_current": true, "is_active": true}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AcademicYearRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.AcademicYear, error) {
	var item models.AcademicYear
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AcademicYearRepository) Update(ctx context.Context, id primitive.ObjectID, ay *models.AcademicYear) error {
	ay.UpdatedAt = time.Now()
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": ay})
	return err
}

func (r *AcademicYearRepository) SetCurrent(ctx context.Context, id primitive.ObjectID) error {
	// First unset all current
	_, err := r.collection.UpdateMany(ctx, bson.M{}, bson.M{"$set": bson.M{"is_current": false}})
	if err != nil {
		return err
	}
	// Set the specified one as current
	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"is_current": true, "updated_at": time.Now()}})
	return err
}
