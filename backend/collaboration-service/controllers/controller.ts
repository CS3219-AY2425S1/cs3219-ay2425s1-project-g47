import { Request, Response } from "express";
import { MatchModel } from "../models/match";
import { SessionModel } from "../models/session";

// AuthorisedUserHandler checks if a user is authorised to join the room
export const checkAuthorisedUser = async (req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Type", "application/json");
  const userId = req.query.userId as string;
  const roomId = req.query.roomId as string;

  if (!userId || !roomId) {
    res.status(400).json({ error: "Missing userId or roomId" });
    return;
  }

  try {
    const match = await MatchModel.findOne({ room_id: roomId }).exec();
    if (!match) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const isAuthorised = match.userOne === userId || match.userTwo === userId;
    res.json({ authorised: isAuthorised });
  } catch (error) {
    console.error("Error finding room associated with user", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GetInfoHandler retrieves the room info  for a match based on the roomId
export const getInfoHandler = async (req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Type", "application/json");

  const roomId = req.query.roomId as string;
  if (!roomId) {
    res.status(400).json({ error: "Missing roomId" });
    return;
  }

  try {
    // Find the match in the MongoDB collection
    const match = await MatchModel.findOne({ room_id: roomId }).exec();
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    // Check if the question exists in the match
    if (!match.question || !match.question.questionId) {
      res.status(404).json({ error: "No question found for the given roomId" });
      return;
    }

    if (match.status === "open") {
      res.cookie('roomId', roomId, {
        // httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000 
      });
    }

    // Send the match information as a JSON response
    res.json(match);
  } catch (error) {
    console.error("Error finding match:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get History Handler
export const getHistoryHandler = async (req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Type", "application/json");
  const username = req.query.username as string;

  if (!username) {
    res.status(400).json({ error: "Missing username" });
    return;
  }

  // Parse 'page' and 'limit' query parameters with default values
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  try {
    // Count total sessions matching the query
    const totalSessions = await SessionModel.countDocuments({
      $or: [{ userOne: username }, { userTwo: username }]
    }).exec();

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Retrieve sessions with pagination and sorting by createdAt in descending order
    const sessions = await SessionModel.find({
      $or: [{ userOne: username }, { userTwo: username }]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Calculate total pages
    const totalPages = Math.ceil(totalSessions / limit);

    // Send paginated response with sessions and pagination info
    res.json({
      sessions,
      totalPages,
      currentPage: page,
      totalSessions
    });
  } catch (error) {
    console.error("Error retrieving history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Save Code Handler
export const saveCodeHandler = async (req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Type", "application/json");
  const { roomId, code, language } = req.body;
  console.log(roomId + code + language);

  res.clearCookie("roomId", {
    // httpOnly: true,
  });
  
  try {
    const existingSession = await SessionModel.findOne({ room_id: roomId }).exec();
    if (existingSession) {
      // If session exists, do nothing and return a success message
      res.json({ message: "Session already exists", session: existingSession });
      return;
    }

    const match = await MatchModel.findOne({ room_id: roomId }).exec();
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    const newSession = new SessionModel({
      userOne: match.userOne,
      userTwo: match.userTwo,
      room_id: roomId,
      code: code,
      programming_language: language,
      question: match.question,
      createdAt: new Date(),
    });

    await newSession.save();

    // Update the match status to 'closed'
    match.status = "closed";
    await match.save();

    res.status(200).json({ message: "Code saved successfully, match closed", session: newSession });
  } catch (error) {
    console.error("Error saving code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const clearRoomIdCookie = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("roomId", {
    // httpOnly: true,
  });

  res.json({ message: "RoomId cookie has been cleared" });
};


// GetSessionHandler retrieves a session based on the roomId
export const getSessionHandler = async (req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Type", "application/json");
  
  const roomId = req.query.roomId as string;
  if (!roomId) {
    res.status(400).json({ error: "Missing roomId" });
    return;
  }

  try {
    const session = await SessionModel.findOne({ room_id: roomId }).exec();
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(session);
  } catch (error) {
    console.error("Error finding session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
