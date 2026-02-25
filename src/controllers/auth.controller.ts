import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { HTTP_STATUS } from "../config";
import { config } from "../config/app.config";
import AppError from "../utils/AppError";
import "../types";

// helper to sign a JWT token
const signToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    config.jwtSecret as jwt.Secret,
    { expiresIn: "7d" } as jwt.SignOptions,
  );
};

// signup
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return next(
        new AppError("Please provide all fields", HTTP_STATUS.BAD_REQUEST),
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(
        new AppError(
          "Please provide a valid email address",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    // Validate password minimum length
    if (password.length < 8) {
      return next(
        new AppError(
          "Password must be at least 8 characters long",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new AppError("Email already exists", HTTP_STATUS.CONFLICT));
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    const token = signToken(
      newUser._id.toString(),
      newUser.email,
      newUser.role,
    );

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      message: "Account created successfully",
      token,
      data: {
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new AppError(
          "Please provide email and password",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password))) {
      return next(
        new AppError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED),
      );
    }

    const token = signToken(user._id.toString(), user.email, user.role);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Login successful",
      token,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// get current user profile
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select("-password");

    if (!user) {
      return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// update current user profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    if (!req.body) {
      return next(
        new AppError(
          "Please provide first name and last name",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(address && { address }),
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// logout (JWT is stateless — frontend discards the token)
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(HTTP_STATUS.Ok).json({
    status: "success",
    message: "Logged out successfully",
  });
};
