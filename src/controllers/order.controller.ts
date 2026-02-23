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
): Promise<void> => {
  try {
    const { userId } = req.params;

    const filter: Record<string, unknown> = { user: userId };

    // Filter by status: ?status=ongoing or ?status=completed
    if (req.query.status) {
      const status = req.query.status as string;
      if (status === "ongoing") {
        filter.orderStatus = { $in: ["pending", "ongoing"] };
      } else if (status === "completed") {
        filter.orderStatus = { $in: ["completed", "cancelled"] };
      }
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "orderId items totalPrice orderStatus address phoneNumber shippingMethod createdAt",
      );

    res.status(HTTP_STATUS.Ok).json({
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
