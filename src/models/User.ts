import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserType } from "../validators/user.schema";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    memberSince: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export interface IUser extends mongoose.Document, UserType {
  correctPassword(candidatePassword: string): Promise<boolean>;
}

// for hashing a password
userSchema.pre("save", async function () {
  //  1) Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
