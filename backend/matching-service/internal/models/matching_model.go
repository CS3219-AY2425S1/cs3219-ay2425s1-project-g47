package models

type MatchStatusEnum string

const (
	Matched   MatchStatusEnum = "Matched"
	Pending   MatchStatusEnum = "Pending"
	Timeout   MatchStatusEnum = "Timeout"
	Cancelled MatchStatusEnum = "Cancelled"
)

type QuestionComplexityEnum string

const (
	Easy   QuestionComplexityEnum = "Easy"
	Medium QuestionComplexityEnum = "Medium"
	Hard   QuestionComplexityEnum = "Hard"
)

// ProgrammingLanguageEnum contains 8 common programming languages
type ProgrammingLanguageEnum string

const (
	Go         ProgrammingLanguageEnum = "Go"
	Python     ProgrammingLanguageEnum = "Python"
	Java       ProgrammingLanguageEnum = "Java"
	Cpp        ProgrammingLanguageEnum = "C++"
	JavaScript ProgrammingLanguageEnum = "JavaScript"
	Ruby       ProgrammingLanguageEnum = "Ruby"
	Swift      ProgrammingLanguageEnum = "Swift"
	CSharp     ProgrammingLanguageEnum = "C#"
)

// MatchingInfo struct includes user matching criteria
type MatchingInfo struct {
	UserID               string                    `json:"user_id" bson:"user_id"`
	SocketID             string                    `json:"socket_id" bson:"socket_id"`
	DifficultyLevel      []QuestionComplexityEnum  `json:"difficulty_levels" bson:"difficulty_levels"`
	Categories           []string                  `json:"categories" bson:"categories"`
	ProgrammingLanguages []ProgrammingLanguageEnum `json:"programming_languages" bson:"programming_languages"`
	GeneralizeLanguages  bool                      `json:"generalize_languages" bson:"generalize_languages"`
	Status               MatchStatusEnum           `json:"status" bson:"status"`
	RoomID               string                    `json:"room_id" bson:"room_id"`
}

type MatchResult struct {
	UserOneSocketID string `json:"user_one_socket_id"`
	UserTwoSocketID string `json:"user_two_socket_id"`
	RoomID          string `json:"room_id"`
}
