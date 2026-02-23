import { NextFunction, Request, Response } from "express";
import Product from "../models/Product";
import Category from "../models/Category";
import Collection from "../models/Collection";
import { HTTP_STATUS } from "../config";

// ─────────────────────────────────────────────
//  PUBLIC PRODUCT ENDPOINTS
// ─────────────────────────────────────────────

/**
 * GET /api/v1/products
 * Paginated list with advanced filters (collection, category, jewelryType,
 * material, karat, weight, size, priceMin/priceMax, search)
 */
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.collection) {
      // Accept slug — resolve to ObjectId
      const col = await Collection.findOne({ slug: req.query.collection });
      if (col) filter.productCollection = col._id;
    }
    if (req.query.category) {
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) filter.productCategory = cat._id;
    }
    if (req.query.jewelryType) {
      filter.productJewelryType = req.query.jewelryType;
    }
    if (req.query.material) {
      filter.productMaterial = req.query.material;
    }
    if (req.query.karat) {
      filter.productKarat = req.query.karat;
    }
    if (req.query.weight) {
      filter.productWeight = req.query.weight;
    }
    if (req.query.size) {
      filter["productSizes.size"] = req.query.size;
    }
    if (req.query.search) {
      filter.productName = {
        $regex: req.query.search as string,
        $options: "i",
      };
    }
    if (req.query.priceMin || req.query.priceMax) {
      const priceFilter: Record<string, number> = {};
      if (req.query.priceMin) priceFilter.$gte = Number(req.query.priceMin);
      if (req.query.priceMax) priceFilter.$lte = Number(req.query.priceMax);
      filter.productPrice = priceFilter;
    }

    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .populate("productCategory", "name slug")
        .populate("productCollection", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: { products },
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

/**
 * GET /api/v1/products/:id
 */
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("productCategory", "name slug")
      .populate("productCollection", "name slug");

    if (!product) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: "fail",
        message: "Product not found",
      });
      return;
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/new-arrivals
 */
export const getNewArrivals = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const products = await Product.find({ isNewArrival: true })
      .populate("productCategory", "name slug")
      .populate("productCollection", "name slug")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: products.length,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/best-sellers
 */
export const getBestSellers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const products = await Product.find({})
      .populate("productCategory", "name slug")
      .populate("productCollection", "name slug")
      .sort({ salesCount: -1 })
      .limit(limit);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: products.length,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/collections  (public — list all collections)
 */
export const getPublicCollections = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const collections = await Collection.find({}).sort({ name: 1 });

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: collections.length,
      data: { collections },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/categories  (public — list all categories)
 */
export const getPublicCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: categories.length,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};
