import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { HTTP_STATUS } from "../config";

export const allUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const allUsers = await User.find({}).select(
      "_id firstName lastName email memberSince",
    );

    if (!allUsers || allUsers.length === 0) {
      res.status(HTTP_STATUS.NO_CONTENT).json({
        status: "success",
        message: "There is no data here",
      });
      return;
    }

    const formattedUsers = allUsers.map((user) => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      memberSince: user.memberSince,
    }));

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: allUsers.length,
      data: {
        formattedUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  try {
    const userDetail = await User.findById(id);

    if (!userDetail) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: "fail",
        message: "There is no data here",
      });
      return;
    }

    /* 
    TODO: RETURN ONLY THE FOLLOWING FOR THE USERS
    - name (firstName, lastName)
    - email
    - memberSince
    -orders
    */

    if (userDetail) {
      res.status(HTTP_STATUS.Ok).json({
        status: "success",
        data: userDetail,
      });

      return;
    }
  } catch (error) {
    next(error);
  }
};
