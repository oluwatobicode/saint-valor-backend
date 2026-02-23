import { NextFunction, Request, Response } from "express";
import Favourite from "../models/Favourite";
import Product from "../models/Product";
import { HTTP_STATUS } from "../config";

/**
 * GET /api/v1/favourites?userId=xxx
 * Get all favourites for a user (populated with product details)
 */
export const getUserFavourites = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "userId is required",
      });
      return;
    }

    const favourites = await Favourite.find({ userId })
      .populate({
        path: "productId",
        select:
          "productName productPrice mainImage productJewelryType productCollection",
        populate: { path: "productCollection", select: "name" },
      })
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: favourites.length,
      data: { favourites },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/favourites
 * Body: { userId, productId }
 */
export const addFavourite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "userId and productId are required",
      });
      return;
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: "fail",
        message: "Product not found",
      });
      return;
    }

    // Check if already favourited (compound index will also prevent dupes)
    const existing = await Favourite.findOne({ userId, productId });
    if (existing) {
      res.status(HTTP_STATUS.CONFLICT).json({
        status: "fail",
        message: "Product is already in your favourites",
      });
      return;
    }

    const favourite = await Favourite.create({ userId, productId });

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      message: "Product added to favourites",
      data: { favourite },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/favourites/:productId?userId=xxx
 * Remove a product from user's favourites
 */
export const removeFavourite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "userId query parameter is required",
      });
      return;
    }

    const deleted = await Favourite.findOneAndDelete({
      userId,
      productId,
    });

    if (!deleted) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: "fail",
        message: "Favourite not found",
      });
      return;
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Product removed from favourites",
    });
  } catch (error) {
    next(error);
  }
};
