import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import mongoose from "mongoose";
import {
  authRoutes,
  orderRoutes,
  userRoutes,
  adminRoutes,
  productRoutes,
  favouriteRoutes,
} from "./routes";
import { productController } from "./controllers";
import { swaggerSpec } from "./config/swagger.config";
import globalErrorHandler from "./middleware/error.middleware";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  mongoose.connection.close().finally(() => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
  mongoose.connection.close().finally(() => process.exit(1));
});

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Saint Valor API Docs",
  }),
);

// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Jewelry E-Commerce API",
    version: "1.0.0",
    status: "running",
    docs: "/api-docs",
  });
});

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/favourites", favouriteRoutes);

// Standalone public product endpoints
app.get("/api/v1/new-arrivals", productController.getNewArrivals);
app.get("/api/v1/best-sellers", productController.getBestSellers);
app.get("/api/v1/collections", productController.getPublicCollections);
app.get("/api/v1/categories", productController.getPublicCategories);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;

