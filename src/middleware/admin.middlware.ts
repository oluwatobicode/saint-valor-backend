import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../config";

// checking if user has admin role
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      status: "fail",
      message: "Access denied. Admin privileges required.",
    });
    return;
  }

  next();
};
