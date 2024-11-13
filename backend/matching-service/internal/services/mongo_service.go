package services

import (
	"context"
	"log"
	"matching-service/internal/models"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MatchingCollection *mongo.Collection

// ConnectToMongo initializes the MongoDB connection and collection
func ConnectToMongo() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Get MongoDB URI and database name from environment variables
	mongoURI := os.Getenv("MONGO_URI_MS")
	dbName := os.Getenv("MONGO_DBNAME")

	if mongoURI == "" || dbName == "" {
		log.Fatalf("MongoDB URI or DB name not set in .env file")
	}

	// Set MongoDB client options
	clientOptions := options.Client().ApplyURI(mongoURI)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect to MongoDB
	MongoClient, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Ping MongoDB to verify connection
	err = MongoClient.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Error pinging MongoDB: %v", err)
	}

	// Initialize the collection
	MatchingCollection = MongoClient.Database(dbName).Collection("matching")
	log.Printf("Connected to database: %s, collection: %s", dbName, MatchingCollection.Name())
	log.Println("Connected to MongoDB")
}

// InsertMatching inserts a matching entry into the MongoDB collection
func InsertMatching(matchingInfo models.MatchingInfo) (*models.MatchingInfo, error) {
	log.Printf("Inserting document: %+v", matchingInfo)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Insert the matchingInfo into the MongoDB collection
	result, err := MatchingCollection.InsertOne(ctx, matchingInfo)
	if err != nil {
		log.Printf("Error inserting matching info: %v", err)
		return nil, err
	}

	log.Printf("MongoDB Insert Result: %+v", result)
	log.Printf("Inserted matching info for user_id: %s", matchingInfo.UserID)
	return &matchingInfo, nil
}

// FindMatch finds a pending match for a user based on difficulty and topics
func FindMatch(matchingInfo models.MatchingInfo) (*models.MatchingInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Base filter criteria for finding a match
	filter := bson.M{
		"status": models.Pending,
		"user_id": bson.M{
			"$ne": matchingInfo.UserID,
		},
		"difficulty_levels": bson.M{
			"$in": matchingInfo.DifficultyLevel,
		},
		"categories": bson.M{
			"$in": matchingInfo.Categories,
		},
	}

	if !matchingInfo.GeneralizeLanguages {
		filter["$or"] = []bson.M{
			{"programming_languages": bson.M{"$in": matchingInfo.ProgrammingLanguages}},
			{"generalize_languages": true},
		}
	}

	// Try to find a matching user
	var potentialMatch models.MatchingInfo
	err := MatchingCollection.FindOne(ctx, filter).Decode(&potentialMatch)
	if err != nil {
		log.Printf("No matching user found for user_id: %s", matchingInfo.UserID)
		return nil, nil
	}

	// Mark the potential match as matched
	_, err = MatchingCollection.UpdateOne(ctx, bson.M{"user_id": potentialMatch.UserID}, bson.M{
		"$set": bson.M{"status": models.Matched},
	})

	if err != nil {
		log.Printf("Error updating match status for user_id %s: %v", potentialMatch.UserID, err)
		return nil, err
	}

	log.Printf("Found match for user_id: %s", matchingInfo.UserID)
	return &potentialMatch, nil
}

func MarkAsTimeout(matchingInfo models.MatchingInfo) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Recheck the user's status to ensure they are still Pending
	currentStatus, err := GetUserStatus(matchingInfo.UserID)
	if err != nil {
		return err
	}

	// Only mark as Timeout if the user is still Pending
	if currentStatus != models.Pending {
		log.Printf("User %s is not Pending, skipping Timeout marking", matchingInfo.UserID)
		return nil
	}

	// Update the user's status to Timeout in MongoDB
	_, err = MatchingCollection.UpdateOne(ctx, bson.M{
		"user_id": matchingInfo.UserID,
		"status":  models.Pending,
	}, bson.M{
		"$set": bson.M{"status": models.Timeout},
	})

	if err != nil {
		log.Printf("Error marking user_id %s as Timeout: %v", matchingInfo.UserID, err)
		return err
	}

	log.Printf("User %s has been marked as Timeout", matchingInfo.UserID)
	// Delete the user from MongoDB after status change
	err = deleteUserFromDB(matchingInfo.UserID)
	if err != nil {
		log.Printf("Error deleting user with user_id %s: %v", matchingInfo.UserID, err)
		return err
	}

	log.Printf("User with user_id %s has been deleted from the database", matchingInfo.UserID)
	return nil
}

// UpdateMatchStatusAndRoomID updates the room_id of both users in MongoDB and deletes them after matching
func UpdateMatchStatusAndRoomID(userID1, userID2, roomID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	users := []string{userID1, userID2}
	for _, userID := range users {
		// Set the filter and update instructions for each user
		filter := bson.M{"user_id": userID, "status": models.Pending} // Ensure user is Pending
		update := bson.M{
			"$set": bson.M{
				"status":  models.Matched, // Set status to Matched
				"room_id": roomID,         // Update the room_id
			},
		}

		// Attempt to update the user's status and room ID
		_, err := MatchingCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			log.Printf("Error updating match status and room_id for user_id %s: %v", userID, err)
			return err
		}
		log.Printf("Updated user_id %s status to 'Matched' and room_id to %s", userID, roomID)

		// Delete the user after successfully updating their match status and room ID
		err = deleteUserFromDB(userID)
		if err != nil {
			log.Printf("Error deleting user with user_id %s: %v", userID, err)
			return err
		}
		log.Printf("User with user_id %s has been deleted from the database", userID)
	}

	return nil
}

// GetUserStatus retrieves the current status of the user from MongoDB
func GetUserStatus(userID string) (models.MatchStatusEnum, error) {
	// Set up the MongoDB collection (assuming you have a users collection)
	collection := MatchingCollection
	// Create a context with a timeout for the query
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Filter for the userID
	filter := bson.M{"user_id": userID}

	// Define a struct to hold the result
	var result struct {
		Status models.MatchStatusEnum `bson:"status"`
	}

	// Query MongoDB for the user's status
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("No user found with user_id: %s", userID)
			return "", nil
		}
		log.Printf("Error retrieving status for user_id: %s, error: %v", userID, err)
		return "", err
	}

	// Return the status
	return result.Status, nil
}

// CancelUserMatch updates the user's status to 'Cancelled' in MongoDB
func CancelUserMatch(userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update the user's status to 'Cancelled' if they are currently 'Pending'
	filter := bson.M{
		"user_id": userID,
		"status":  models.Pending, 
	}
	update := bson.M{
		"$set": bson.M{"status": models.Cancelled},
	}

	// perform the update in MongoDB
	result, err := MatchingCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Printf("Error updating status to 'Cancelled' for user_id: %s, error: %v", userID, err)
		return err
	}

	// check if a document was actually updated (i.e., if the user was in 'Pending' status)
	if result.ModifiedCount == 0 {
		log.Printf("No pending match found for user_id: %s, unable to cancel", userID)
		return nil
	}

	log.Printf("User %s has been successfully marked as 'Cancelled'", userID)
	// delete the user from MongoDB after status change
	err = deleteUserFromDB(userID)
	if err != nil {
		log.Printf("Error deleting user with user_id %s: %v", userID, err)
		return err
	}

	log.Printf("User with user_id %s has been deleted from the database", userID)
	return nil
}

// deleteUserFromDB deletes a user from MongoDB by user_id
func deleteUserFromDB(userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"user_id": userID}
	_, err := MatchingCollection.DeleteOne(ctx, filter)
	if err != nil {
		log.Printf("Error deleting user_id %s from the database: %v", userID, err)
		return err
	}

	log.Printf("Successfully deleted user_id %s from the database", userID)
	return nil
}

func DeleteUnusedFromDB() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"status": bson.M{"$ne": "Pending"}}

	result, err := MatchingCollection.DeleteMany(ctx, filter)
	if err != nil {
		log.Printf("Error deleting unused entries from the database: %v", err)
		return err
	}

	log.Printf("Successfully deleted %d unused entries from the database", result.DeletedCount)
	return nil
}
