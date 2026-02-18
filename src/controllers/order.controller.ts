import { NextFunction, Request, Response } from "express";
import Order from "../models/Order";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    firstName,
    lastName,
    countryCode,
    phoneNumber,
    address,
    country,
    state,
    city,
    shippingMethod,
    items,
    totalPrice,
    userId,
  } = req.body;
  try {
    const order = await Order.create({
      firstName,
      lastName,
      countryCode,
      phoneNumber,
      address,
      country,
      state,
      city,
      shippingMethod,
      items,
      totalPrice,
      user: userId,
    });

    res.status(201).json({
      status: "success",
      message: "You have successfully created an order",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);

    console.log(error);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};
