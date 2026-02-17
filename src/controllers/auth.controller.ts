import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { HTTP_STATUS } from "../config";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "Please provide all fields",
      });
      return;
    }

    const user = await User.findOne({ email });

    if (user) {
      res.status(HTTP_STATUS.CONFLICT).json({
        status: "fail",
        message: "Email already exists",
      });
      return;
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "Please provide email and password",
      });
      return;
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password))) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: "fail",
        message: "Invalid credentials",
      });
      return;
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
