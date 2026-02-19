import { NextFunction, Request, Response } from "express";
import Order from "../models/Order";
import { HTTP_STATUS } from "../config";
import { generateOrderId } from "../utils/generateOrderId";

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
    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
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
): Promise<void> => {
  try {
    const allOrders = await Order.find({}).select("orderID");

    if (!allOrders || allOrders.length === 0) {
      res.status(HTTP_STATUS.Ok).json({
        status: "success",
        message: "No orders found",
        data: {
          allOrders: [],
        },
      });
      return;
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: allOrders.length,
      data: {
        allOrders,
      },
    });
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
    const orders = await Order.find({ user: userId }).select(
      "orderId items status address phoneNumber shippingMethod createdAt",
    );

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
