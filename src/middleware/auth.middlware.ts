import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { config } from "../config/app.config";
import { HTTP_STATUS } from "../config";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// verifying the JWT token and attaching the user to the request
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: "fail",
        message: "No token provided. Please login.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: "fail",
        message: "User no longer exists.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: "fail",
        message: "Token expired. Please login again.",
      });
      return;
    }

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: "fail",
      message: "Invalid token. Please login.",
    });
  }
};
