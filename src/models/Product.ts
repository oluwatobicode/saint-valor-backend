import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    productCollection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    productJewelryType: {
      type: String,
      enum: [
        "Rings",
        "Necklaces",
        "Earrings",
        "Bracelets",
        "Pant Chains",
        "Anklets",
      ],
      required: true,
    },
    productMaterial: {
      type: String,
      enum: ["Gold", "VVS Diamonds Natural", "VVS Diamonds Lab"],
      required: true,
    },
    productKarat: {
      type: String,
      enum: ["14k", "18k", "24k"],
    },
    productCarat: {
      type: String,
    },
    productWeight: {
      type: String,
      enum: ["3-6g", "7-10g", "11-15g"],
    },
    productSizes: {
      type: [sizeSchema],
      required: true,
    },
    mainImage: {
      type: String,
      required: true,
    },
    subImages: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: "A product can have at most 5 sub-images",
      },
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("product", productSchema);
export default Product;
