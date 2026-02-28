import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { HTTP_STATUS } from "../config";
import { config } from "../config/app.config";
import AppError from "../utils/AppError";
import "../types";
import { sendOtpEmail, sendWelcomeEmail } from "../services/email.service";
import crypto from "crypto";

// helper to sign a JWT token
const signToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    config.jwtSecret as jwt.Secret,
    { expiresIn: "7d" } as jwt.SignOptions,
  );
};

// Generate a 6-digit OTP
const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
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

    // Generate OTP and set expiry (10 minutes)
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
    });

    // Send OTP email (fire-and-forget)
    sendOtpEmail(newUser.email, otp);

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      message:
        "Account created. A 6-digit verification code has been sent to your email.",
      data: {
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// verify email with OTP
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(
        new AppError(
          "Please provide your email and the verification code",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    // Select the OTP fields (excluded by default)
    const user = await User.findOne({ email }).select(
      "+verificationOtp +verificationOtpExpires",
    );

    if (!user) {
      return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
    }

    if (user.isVerified) {
      return next(
        new AppError("Email is already verified", HTTP_STATUS.BAD_REQUEST),
      );
    }

    if (
      !user.verificationOtp ||
      !user.verificationOtpExpires ||
      user.verificationOtp !== otp.toString() ||
      user.verificationOtpExpires < new Date()
    ) {
      return next(
        new AppError(
          "Invalid or expired verification code",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    // Mark as verified and clear OTP fields
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    // Send welcome email (fire-and-forget)
    sendWelcomeEmail(user.email, user.firstName);

    // Issue JWT now that verification is complete
    const token = signToken(user._id.toString(), user.email, user.role);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Email verified successfully. Welcome to Saint Valor!",
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
    next(error);
  }
};

// resend verification OTP
export const resendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(
        new AppError("Please provide your email", HTTP_STATUS.BAD_REQUEST),
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
    }

    if (user.isVerified) {
      return next(
        new AppError("Email is already verified", HTTP_STATUS.BAD_REQUEST),
      );
    }

    const otp = generateOtp();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendOtpEmail(user.email, otp);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
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

    if (!user.isVerified) {
      return next(
        new AppError(
          "Please verify your email before logging in",
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    const token = signToken(user._id.toString(), user.email, user.role);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Login successful",
      token,
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

    if (!firstName && !lastName && !phone && !address) {
      return next(
        new AppError(
          "Please provide at least one field to update",
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
