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

type SeatMatrixRepository struct {
	collection *mongo.Collection
}

func NewSeatMatrixRepository(db *mongo.Database) *SeatMatrixRepository {
	return &SeatMatrixRepository{collection: db.Collection("seat_matrices")}
}

func (r *SeatMatrixRepository) Create(ctx context.Context, sm *models.SeatMatrix) error {
	sm.CreatedAt = time.Now()
	sm.UpdatedAt = time.Now()
	sm.IsActive = true
	if sm.ID.IsZero() {
		sm.ID = primitive.NewObjectID()
	}
	_, err := r.collection.InsertOne(ctx, sm)
	return err
}

func (r *SeatMatrixRepository) FindAll(ctx context.Context) ([]models.SeatMatrix, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"is_active": true}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.SeatMatrix
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *SeatMatrixRepository) FindByProgramAndYear(ctx context.Context, programID, yearID primitive.ObjectID) (*models.SeatMatrix, error) {
	var item models.SeatMatrix
	err := r.collection.FindOne(ctx, bson.M{
		"program_id":       programID,
		"academic_year_id": yearID,
		"is_active":        true,
	}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SeatMatrixRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.SeatMatrix, error) {
	var item models.SeatMatrix
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SeatMatrixRepository) Update(ctx context.Context, id primitive.ObjectID, sm *models.SeatMatrix) error {
	sm.UpdatedAt = time.Now()
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": sm})
	return err
}

func (r *SeatMatrixRepository) IncrementQuotaFilled(ctx context.Context, id primitive.ObjectID, quotaType models.QuotaType) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"_id": id, "quotas.quota_type": quotaType},
		bson.M{
			"$inc": bson.M{
				"quotas.$.filled_seats":    1,
				"quotas.$.remaining_seats": -1,
				"total_filled":             1,
				"total_remaining":          -1,
			},
			"$set": bson.M{"updated_at": time.Now()},
		},
	)
	return err
}

func (r *SeatMatrixRepository) DecrementQuotaFilled(ctx context.Context, id primitive.ObjectID, quotaType models.QuotaType) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"_id": id, "quotas.quota_type": quotaType},
		bson.M{
			"$inc": bson.M{
				"quotas.$.filled_seats":    -1,
				"quotas.$.remaining_seats": 1,
				"total_filled":             -1,
				"total_remaining":          1,
			},
			"$set": bson.M{"updated_at": time.Now()},
		},
	)
	return err
}

func (r *SeatMatrixRepository) FindByAcademicYear(ctx context.Context, yearID primitive.ObjectID) ([]models.SeatMatrix, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"academic_year_id": yearID, "is_active": true})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.SeatMatrix
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}
