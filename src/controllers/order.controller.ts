import { NextFunction, Request, Response } from "express";
import Order from "../models/Order";
import { HTTP_STATUS } from "../config";
import { config } from "../config/app.config";
import { generateOrderId } from "../utils/generateOrderId";
import { initializeTransaction, verifyTransaction } from "../utils/paystack";
import "../types";

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
      user: req.user?._id,
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
    const userId = req.user?._id;

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

// this is to initialize order and get Paystack payment URL
export const initializeOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const email = req.user?.email;
    const {
      items,
      firstName,
      lastName,
      countryCode,
      phoneNumber,
      address,
      country,
      state,
      city,
      shippingMethod,
    } = req.body;

    if (!items || !items.length || !email) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "items and email are required",
      });
      return;
    }

    // Calculate total from items
    const totalPrice = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0,
    );

    // Generate unique reference
    const reference = `SV-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Amount in kobo (naira × 100)
    const amountInKobo = Math.round(totalPrice * 100);

    // Call Paystack to initialize payment
    const paystackResponse = await initializeTransaction(
      email,
      amountInKobo,
      reference,
      config.paystackCallbackUrl || "",
    );

    if (!paystackResponse.status) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "Payment initialization failed",
        error: paystackResponse.message,
      });
      return;
    }

    // Store the pending order details in response so frontend and can send them back when verifying
    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Payment initialized",
      data: {
        authorization_url: paystackResponse.data.authorization_url,
        access_code: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
        orderDetails: {
          items,
          totalPrice,
          firstName,
          lastName,
          countryCode,
          phoneNumber,
          address,
          country,
          state,
          city,
          shippingMethod,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// this is to Verify Paystack payment and create order
export const verifyOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reference = req.params.reference as string;

    // Check if order with this reference already exists
    const existingOrder = await Order.findOne({ paystackReference: reference });
    if (existingOrder) {
      res.status(HTTP_STATUS.Ok).json({
        status: "success",
        message: "Order already verified",
        data: { order: existingOrder },
      });
      return;
    }

    // Verify with Paystack
    const paystackResponse = await verifyTransaction(reference);

    if (
      !paystackResponse.status ||
      paystackResponse.data.status !== "success"
    ) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "Payment verification failed",
        paymentStatus: paystackResponse.data?.status || "unknown",
      });
      return;
    }

    // if Payment succeeded — create the order
    const userId = req.user?._id;
    const {
      items,
      firstName,
      lastName,
      countryCode,
      phoneNumber,
      address,
      country,
      state,
      city,
      shippingMethod,
    } = req.body;

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
      totalPrice: paystackResponse.data.amount / 100, // Convert it from kobo back to naira
      user: userId,
      orderStatus: "ongoing",
      paymentStatus: "paid",
      paystackReference: reference,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      message: "Payment verified and order created",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single order by ID
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "firstName lastName email",
    );

    if (!order) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: "fail",
        message: "Order not found",
      });
      return;
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
