import { NextFunction, Request, Response } from "express";
import Favourite from "../models/Favourite";
import Product from "../models/Product";
import { HTTP_STATUS } from "../config";
import AppError from "../utils/AppError";
import "../types";

// Get all favourites for the logged-in user (populated with product details)
export const getUserFavourites = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?._id;

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

// add to favourite
export const addFavourite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!productId) {
      return next(new AppError("productId is required", HTTP_STATUS.BAD_REQUEST));
    }

    // Checking if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError("Product not found", HTTP_STATUS.NOT_FOUND));
    }

    // Checking if product is already favourited (compound index will also prevent dupes)
    const existing = await Favourite.findOne({ userId, productId });
    if (existing) {
      return next(
        new AppError("Product is already in your favourites", HTTP_STATUS.CONFLICT),
      );
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

// Removing a product from user's favourites
export const removeFavourite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    const deleted = await Favourite.findOneAndDelete({
      userId,
      productId,
    });

    if (!deleted) {
      return next(new AppError("Favourite not found", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Product removed from favourites",
    });
  } catch (error) {
    next(error);
  }
};
