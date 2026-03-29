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

type AdmissionRepository struct {
	collection *mongo.Collection
}

func NewAdmissionRepository(db *mongo.Database) *AdmissionRepository {
	return &AdmissionRepository{collection: db.Collection("admissions")}
}

func (r *AdmissionRepository) Create(ctx context.Context, adm *models.Admission) error {
	adm.CreatedAt = time.Now()
	adm.UpdatedAt = time.Now()
	if adm.ID.IsZero() {
		adm.ID = primitive.NewObjectID()
	}
	_, err := r.collection.InsertOne(ctx, adm)
	return err
}

func (r *AdmissionRepository) FindAll(ctx context.Context) ([]models.Admission, error) {
	cursor, err := r.collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Admission
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *AdmissionRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Admission, error) {
	var item models.Admission
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AdmissionRepository) FindByApplicant(ctx context.Context, applicantID primitive.ObjectID) (*models.Admission, error) {
	var item models.Admission
	err := r.collection.FindOne(ctx, bson.M{"applicant_id": applicantID}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AdmissionRepository) UpdateFeeStatus(ctx context.Context, id primitive.ObjectID, feeStatus models.FeeStatus) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{"fee_status": feeStatus, "updated_at": time.Now()},
	})
	return err
}

func (r *AdmissionRepository) ConfirmAdmission(ctx context.Context, id primitive.ObjectID, admissionNumber string) error {
	now := time.Now()
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{
			"admission_number": admissionNumber,
			"is_confirmed":     true,
			"confirmed_at":     &now,
			"updated_at":       now,
		},
	})
	return err
}

func (r *AdmissionRepository) CountConfirmed(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"is_confirmed": true})
}

func (r *AdmissionRepository) CountByQuota(ctx context.Context, quotaType models.QuotaType) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"quota_type": quotaType, "is_confirmed": true})
}

func (r *AdmissionRepository) CountByProgramAndQuota(ctx context.Context, programID primitive.ObjectID, quotaType models.QuotaType) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{
		"program_id":   programID,
		"quota_type":   quotaType,
		"is_confirmed": true,
	})
}

func (r *AdmissionRepository) GetNextSequence(ctx context.Context, programID primitive.ObjectID, quotaType models.QuotaType) (int64, error) {
	count, err := r.collection.CountDocuments(ctx, bson.M{
		"program_id": programID,
		"quota_type": quotaType,
	})
	if err != nil {
		return 0, err
	}
	return count + 1, nil
}

func (r *AdmissionRepository) FindRecent(ctx context.Context, limit int) ([]models.Admission, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(int64(limit))
	cursor, err := r.collection.Find(ctx, bson.M{"is_confirmed": true}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Admission
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}
