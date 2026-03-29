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

type ApplicantRepository struct {
	collection *mongo.Collection
}

func NewApplicantRepository(db *mongo.Database) *ApplicantRepository {
	return &ApplicantRepository{collection: db.Collection("applicants")}
}

func (r *ApplicantRepository) Create(ctx context.Context, app *models.Applicant) error {
	app.CreatedAt = time.Now()
	app.UpdatedAt = time.Now()
	app.IsActive = true
	if app.ID.IsZero() {
		app.ID = primitive.NewObjectID()
	}
	_, err := r.collection.InsertOne(ctx, app)
	return err
}

func (r *ApplicantRepository) FindAll(ctx context.Context, page, perPage int) ([]models.Applicant, int64, error) {
	filter := bson.M{"is_active": true}
	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	skip := int64((page - 1) * perPage)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(perPage))

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var items []models.Applicant
	if err := cursor.All(ctx, &items); err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *ApplicantRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Applicant, error) {
	var item models.Applicant
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ApplicantRepository) Update(ctx context.Context, id primitive.ObjectID, app *models.Applicant) error {
	app.UpdatedAt = time.Now()
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": app})
	return err
}

func (r *ApplicantRepository) UpdateStatus(ctx context.Context, id primitive.ObjectID, status string) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{"status": status, "updated_at": time.Now()},
	})
	return err
}

func (r *ApplicantRepository) UpdateFeeStatus(ctx context.Context, id primitive.ObjectID, feeStatus models.FeeStatus) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{"fee_status": feeStatus, "updated_at": time.Now()},
	})
	return err
}

func (r *ApplicantRepository) UpdateDocuments(ctx context.Context, id primitive.ObjectID, docs []models.Document) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{"documents": docs, "updated_at": time.Now()},
	})
	return err
}

func (r *ApplicantRepository) CountByStatus(ctx context.Context, status string) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"status": status, "is_active": true})
}

func (r *ApplicantRepository) CountPendingDocuments(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{
		"documents.status": models.DocStatusPending,
		"is_active":        true,
	})
}

func (r *ApplicantRepository) CountPendingFees(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{
		"fee_status": models.FeeStatusPending,
		"status":     "SeatAllocated",
		"is_active":  true,
	})
}

func (r *ApplicantRepository) GetNextApplicationNumber(ctx context.Context) (int64, error) {
	total, err := r.collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return 0, err
	}
	return total + 1, nil
}

func (r *ApplicantRepository) FindByProgram(ctx context.Context, programID primitive.ObjectID) ([]models.Applicant, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"program_id": programID, "is_active": true})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Applicant
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}
