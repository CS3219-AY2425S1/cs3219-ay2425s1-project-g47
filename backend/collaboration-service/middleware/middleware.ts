import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function verifyAccessToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies["accessToken"];

  if (!token) {
    res.status(401).json({ message: "Authentication failed" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: Error | null) => {
    if (err) {
      res.status(401).json({ message: "Authentication failed" });
      return;
    }

    next();
  });
}
