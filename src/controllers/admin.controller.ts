import { NextFunction, Request, Response } from "express";
import Category from "../models/Category";
import Collection from "../models/Collection";
import Product from "../models/Product";
import Order from "../models/Order";
import User from "../models/User";
import Favourite from "../models/Favourite";
import { HTTP_STATUS } from "../config";
import { uploadToCloudinary } from "../utils/upload";
import AppError from "../utils/AppError";

//  CATEGORY MANAGEMENT

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: categories.length,
      data: { categories },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(
        new AppError("Category name is required", HTTP_STATUS.BAD_REQUEST),
      );
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return next(
        new AppError(
          "A category with this name already exists",
          HTTP_STATUS.CONFLICT,
        ),
      );
    }

    const category = await Category.create({ name });

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return next(
        new AppError("Category name is required", HTTP_STATUS.BAD_REQUEST),
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError("Category not found", HTTP_STATUS.NOT_FOUND));
    }

    category.name = name;
    await category.save();

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError("Category not found", HTTP_STATUS.NOT_FOUND));
    }

    // Check if any products reference this category
    const productCount = await Product.countDocuments({ productCategory: id });
    if (productCount > 0) {
      return next(
        new AppError(
          `Cannot delete category — ${productCount} product(s) still reference it`,
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    await Category.findByIdAndDelete(id);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

// ─────────────────────────────────────────────
//  COLLECTION MANAGEMENT
// ─────────────────────────────────────────────

export const getAllCollections = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const collections = await Collection.find({}).sort({ createdAt: -1 });

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      results: collections.length,
      data: { collections },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const createCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(
        new AppError("Collection name is required", HTTP_STATUS.BAD_REQUEST),
      );
    }

    const existingCollection = await Collection.findOne({ name });
    if (existingCollection) {
      return next(
        new AppError(
          "A collection with this name already exists",
          HTTP_STATUS.CONFLICT,
        ),
      );
    }

    // Upload image to Cloudinary if a file was provided
    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "collections");
    }

    const collection = await Collection.create({ name, image: imageUrl });

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      message: "Collection created successfully",
      data: { collection },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const updateCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return next(new AppError("Collection not found", HTTP_STATUS.NOT_FOUND));
    }

    if (name) {
      collection.name = name;
    }
    // Upload new image if provided
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, "collections");
      collection.image = imageUrl;
    }

    await collection.save();

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Collection updated successfully",
      data: { collection },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const deleteCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);
    if (!collection) {
      return next(new AppError("Collection not found", HTTP_STATUS.NOT_FOUND));
    }

    const productCount = await Product.countDocuments({
      productCollection: id,
    });
    if (productCount > 0) {
      return next(
        new AppError(
          `Cannot delete collection — ${productCount} product(s) still reference it`,
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    await Collection.findByIdAndDelete(id);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Collection deleted successfully",
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

// ─────────────────────────────────────────────
//  PRODUCT MANAGEMENT
// ─────────────────────────────────────────────

export const getAdminProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter object from query params
    const filter: Record<string, unknown> = {};

    if (req.query.collection) {
      filter.productCollection = req.query.collection;
    }
    if (req.query.category) {
      filter.productCategory = req.query.category;
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
    if (req.query.search) {
      filter.productName = {
        $regex: req.query.search as string,
        $options: "i",
      };
    }
    if (req.query.priceMin || req.query.priceMax) {
      filter.productPrice = {} as Record<string, number>;
      if (req.query.priceMin) {
        (filter.productPrice as Record<string, number>).$gte = Number(
          req.query.priceMin,
        );
      }
      if (req.query.priceMax) {
        (filter.productPrice as Record<string, number>).$lte = Number(
          req.query.priceMax,
        );
      }
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
    console.log(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      productName,
      productDescription,
      productPrice,
      productCategory,
      productCollection,
      productJewelryType,
      productMaterial,
      productKarat,
      productCarat,
      productWeight,
      productSizes,
      isNewArrival,
    } = req.body;

    // Upload images to Cloudinary if files are provided
    const files = req.files as Express.Multer.File[] | undefined;
    let mainImage = req.body.mainImage || "";
    let subImages: string[] = req.body.subImages || [];

    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, "products")),
      );
      mainImage = uploadedUrls[0];
      subImages = uploadedUrls.slice(1);
    }

    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productCategory ||
      !productCollection ||
      !productJewelryType ||
      !productMaterial ||
      !mainImage
    ) {
      return next(
        new AppError(
          "Please provide all required product fields (including at least 1 image)",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    // Parse sizes if sent as JSON string (multipart/form-data)
    let parsedSizes;
    if (typeof productSizes === "string") {
      try {
        parsedSizes = JSON.parse(productSizes);
      } catch {
        return next(
          new AppError(
            'Invalid productSizes format. Must be valid JSON, e.g. [{"size":"Small","quantity":5}]',
            HTTP_STATUS.BAD_REQUEST,
          ),
        );
      }
    } else {
      parsedSizes = productSizes;
    }

    const product = await Product.create({
      productName,
      productDescription,
      productPrice,
      productCategory,
      productCollection,
      productJewelryType,
      productMaterial,
      productKarat,
      productCarat,
      productWeight,
      productSizes: parsedSizes,
      mainImage,
      subImages,
      isNewArrival: isNewArrival || false,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Parse sizes if sent as JSON string
    if (req.body.productSizes && typeof req.body.productSizes === "string") {
      req.body.productSizes = JSON.parse(req.body.productSizes);
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("productCategory", "name slug")
      .populate("productCollection", "name slug");

    if (!product) {
      return next(new AppError("Product not found", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return next(new AppError("Product not found", HTTP_STATUS.NOT_FOUND));
    }

    // Clean up any Favourite documents that reference the deleted product
    await Favourite.deleteMany({ productId: id });

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

//  ORDER MANAGEMENT

export const getAdminOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const [orders, totalItems] = await Promise.all([
      Order.find(filter)
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: { orders },
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
    console.log(error);
  }
};

export const getAdminOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate(
      "user",
      "firstName lastName email phone",
    );

    if (!order) {
      return next(new AppError("Order not found", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["ongoing", "completed", "cancelled"];
    if (!status || !allowedStatuses.includes(status)) {
      return next(
        new AppError(
          `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true, runValidators: true },
    ).populate("user", "firstName lastName email");

    if (!order) {
      return next(new AppError("Order not found", HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      message: `Order status updated to "${status}"`,
      data: { order },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

//  DASHBOARD STATS

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [totalEarningsResult, totalSales, totalUsers, recentOrders] =
      await Promise.all([
        // Sum totalPrice of completed orders
        Order.aggregate([
          { $match: { orderStatus: "completed" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        Order.countDocuments({}),
        User.countDocuments({ role: "customer" }),
        Order.find({})
          .populate("user", "firstName lastName email")
          .sort({ createdAt: -1 })
          .limit(5)
          .select(
            "orderId firstName lastName items totalPrice orderStatus createdAt",
          ),
      ]);

    const totalEarnings =
      totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0;

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: {
        totalEarnings,
        totalSales,
        totalUsers,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

//  USER MANAGEMENT

export const getAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search as string, $options: "i" };
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const [users, totalItems] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: { users },
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
    console.log(error);
  }
};

export const getAdminUserDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
    }

    // Get orders split into ongoing and past
    const [ongoingOrders, pastOrders] = await Promise.all([
      Order.find({ user: id, orderStatus: { $in: ["pending", "ongoing"] } })
        .sort({ createdAt: -1 })
        .select("orderId items totalPrice orderStatus createdAt"),
      Order.find({ user: id, orderStatus: { $in: ["completed", "cancelled"] } })
        .sort({ createdAt: -1 })
        .select("orderId items totalPrice orderStatus createdAt"),
    ]);

    res.status(HTTP_STATUS.Ok).json({
      status: "success",
      data: {
        user,
        ongoingOrders,
        pastOrders,
      },
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};
