import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// A user can favourite a product only once
favouriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favourite = mongoose.model("Favourite", favouriteSchema);
export default Favourite;
