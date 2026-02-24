import { NextFunction, Request, Response } from "express";
import Favourite from "../models/Favourite";
import Product from "../models/Product";
import { HTTP_STATUS } from "../config";
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
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "productId is required",
      });
      return;
    }

    // Checking if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: "fail",
        message: "Product not found",
      });
      return;
    }

    // Checking if product is already favourited (compound index will also prevent dupes)
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
