import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    productCollection: {
      type: String,
      required: true,
    },
    productCarat: {
      type: Number,
      required: true,
    },
    productWeight: {
      type: Number,
      required: true,
    },
    productMaterial: {
      type: String,
      required: true,
    },
    productJewelryType: {
      type: String,
      required: true,
    },
    productSizes: {
      type: Array,
      required: true,
    },
    productImages: {
      type: Array,
      required: true,
    },
    productStock: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
const Product = mongoose.model("product", productSchema);
export default Product;
