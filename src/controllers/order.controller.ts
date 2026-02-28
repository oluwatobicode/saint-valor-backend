import { NextFunction, Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import { HTTP_STATUS } from "../config";
import { config } from "../config/app.config";
import { generateOrderId } from "../utils/generateOrderId";
import { initializeTransaction, verifyTransaction } from "../utils/paystack";
import AppError from "../utils/AppError";
import { orderRecievedEmail } from "../services/email.service";
import "../types";

//  INITIALIZE ORDER
//  Creates a pending order in the DB, then starts Paystack transaction.
//  Frontend gets back the Paystack checkout URL + orderId.

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

    // Validate required fields
    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !firstName ||
      !lastName ||
      !countryCode ||
      !phoneNumber ||
      !address ||
      !country ||
      !state ||
      !shippingMethod ||
      !email
    ) {
      return next(
        new AppError(
          "Please provide all required fields: items, firstName, lastName, countryCode, phoneNumber, address, country, state, shippingMethod",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    const typedItems = items as Array<{
      productId: string;
      size?: string;
      price: number;
      quantity: number;
    }>;

    const totalPrice = typedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (totalPrice <= 0) {
      return next(
        new AppError(
          "Order total must be greater than 0",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    // Atomically reserve stock for each item — prevents concurrent oversell
    const reservedItems: Array<{
      productId: string;
      size: string;
      quantity: number;
    }> = [];

    for (const item of typedItems) {
      // typedItems declared above
      if (!item.size) continue; // skip items without a size (no stock to track)

      const reserved = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          productSizes: {
            $elemMatch: { size: item.size, quantity: { $gte: item.quantity } },
          },
        },
        { $inc: { "productSizes.$.quantity": -item.quantity } },
      );

      if (!reserved) {
        // Rollback any items already reserved in this loop
        if (reservedItems.length > 0) {
          await Promise.all(
            reservedItems.map((r) =>
              Product.findOneAndUpdate(
                { _id: r.productId, "productSizes.size": r.size },
                { $inc: { "productSizes.$.quantity": r.quantity } },
              ),
            ),
          );
        }

        // Fetch product name for a clear error message
        const product = await Product.findById(item.productId).select(
          "productName productSizes",
        );
        const sizeEntry = product?.productSizes?.find(
          (s: { size: string; quantity: number }) => s.size === item.size,
        );

        if (!product) {
          return next(
            new AppError(
              `Product with ID "${item.productId}" not found`,
              HTTP_STATUS.NOT_FOUND,
            ),
          );
        }

        return next(
          new AppError(
            `Insufficient stock for "${product.productName}" (size: ${item.size}). Available: ${sizeEntry?.quantity ?? 0}, Requested: ${item.quantity}`,
            HTTP_STATUS.BAD_REQUEST,
          ),
        );
      }

      reservedItems.push({
        productId: String(item.productId),
        size: item.size,
        quantity: item.quantity,
      });
    }

    // Generate unique Paystack reference
    const reference = `SV-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Amount in kobo (naira × 100)
    const amountInKobo = Math.round(totalPrice * 100);

    // Initialize Paystack transaction
    const paystackResponse = await initializeTransaction(
      email,
      amountInKobo,
      reference,
      config.paystackCallbackUrl || "",
    );

    if (!paystackResponse.status) {
      // Restore reserved stock since payment won't proceed
      if (reservedItems.length > 0) {
        await Promise.all(
          reservedItems.map((r) =>
            Product.findOneAndUpdate(
              { _id: r.productId, "productSizes.size": r.size },
              { $inc: { "productSizes.$.quantity": r.quantity } },
            ),
          ),
        );
      }
      return next(
        new AppError("Payment initialization failed", HTTP_STATUS.BAD_REQUEST),
      );
    }

    // Create the order in DB with paymentStatus: "pending"
    // This means the order is saved before the user pays — verifyOrder will
    // update it to "paid" once Paystack confirms. No body data is trusted at
    // verify time; everything is already stored here server-side.
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
      orderStatus: "pending",
      paymentStatus: "pending",
      paystackReference: reference,
    });

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Payment initialized. Complete payment to confirm your order.",
      data: {
        authorization_url: paystackResponse.data.authorization_url,
        access_code: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
        orderId: order.orderId,
      },
    });
  } catch (error) {
    next(error);
  }
};

//  VERIFY ORDER
//  Verifies Paystack payment and updates the existing pending order.
//  No order data comes from the body — everything was saved at initialize time.

export const verifyOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reference = req.params.reference as string;

    // Find the order by Paystack reference
    const order = await Order.findOne({ paystackReference: reference });

    if (!order) {
      return next(
        new AppError(
          "Order not found for this reference",
          HTTP_STATUS.NOT_FOUND,
        ),
      );
    }

    // Ownership check — users can only verify their own orders
    if (order.user && order.user.toString() !== req.user?._id?.toString()) {
      return next(
        new AppError(
          "You are not authorized to verify this order",
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    // Already verified — prevent double-processing
    if (order.paymentStatus === "paid") {
      res.status(HTTP_STATUS.Ok).json({
        status: "success",
        message: "Order already verified",
        data: { order },
      });
      return;
    }

    // Verify with Paystack
    const paystackResponse = await verifyTransaction(reference);

    const items = order.items as Array<{
      productId: string;
      size?: string;
      quantity: number;
    }>;

    if (
      !paystackResponse.status ||
      paystackResponse.data.status !== "success"
    ) {
      // Mark order as failed
      await Order.findByIdAndUpdate(order._id, { paymentStatus: "failed" });

      // Restore the stock that was reserved at initializeOrder time
      await Promise.all(
        items
          .filter((item) => item.size)
          .map((item) =>
            Product.findOneAndUpdate(
              { _id: item.productId, "productSizes.size": item.size },
              { $inc: { "productSizes.$.quantity": item.quantity } },
            ),
          ),
      );

      return next(
        new AppError("Payment verification failed", HTTP_STATUS.BAD_REQUEST),
      );
    }

    // Payment confirmed — update order status
    order.paymentStatus = "paid";
    order.orderStatus = "ongoing";
    await order.save();

    // Increment salesCount (stock was already decremented at initializeOrder)
    await Promise.all(
      items.map((item) =>
        Product.findByIdAndUpdate(item.productId, {
          $inc: { salesCount: item.quantity },
        }),
      ),
    );

    // Send order confirmation email (fire-and-forget)
    const userEmail = req.user?.email;
    if (userEmail) {
      orderRecievedEmail(userEmail, order.orderId).catch(() => {});
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Payment verified and order confirmed",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  GET ALL ORDERS (admin-facing, all orders)
// ─────────────────────────────────────────────
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [allOrders, totalItems] = await Promise.all([
      Order.find({})
        .select("orderId orderStatus paymentStatus totalPrice createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({}),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: allOrders.length,
      message: allOrders.length === 0 ? "No orders found" : undefined,
      data: { allOrders },
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  GET USER'S ORDERS
// ─────────────────────────────────────────────
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
        "orderId items totalPrice orderStatus address phoneNumber shippingMethod createdAt paymentStatus",
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
  }
};

// ─────────────────────────────────────────────
//  GET A SINGLE ORDER BY ID
// ─────────────────────────────────────────────
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
      return next(new AppError("Order not found", HTTP_STATUS.NOT_FOUND));
    }

    // Ownership check — users can only view their own orders
    if (order.user && order.user.toString() !== req.user?._id?.toString()) {
      return next(
        new AppError(
          "You are not authorized to view this order",
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
