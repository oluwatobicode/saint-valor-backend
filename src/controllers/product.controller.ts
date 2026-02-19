import { NextFunction, Request, Response } from "express";
import Product from "../models/Product";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    productName,
    productDescription,
    productPrice,
    productCategory,
    productCollection,
    productCarat,
    productWeight,
    productMaterial,
    productJewelryType,
    productSizes,
    productImages,
    productStock,
  } = req.body;

  try {
    const product = await Product.create({
      productName,
      productDescription,
      productPrice,
      productCategory,
      productCollection,
      productCarat,
      productWeight,
      productMaterial,
      productJewelryType,
      productSizes,
      productImages,
      productStock,
    });

    res.status(201).json({
      status: "success",
      message: "You have successfully created a product",
      data: {
        product,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};
export const editProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};
