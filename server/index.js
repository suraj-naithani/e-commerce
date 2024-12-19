import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import Stripe from "stripe";
import { corsOptions } from "./constants/config.js";
import { connectDB } from "./utils/features.js";

import authRoute from "./routes/authRoute.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import productRoute from "./routes/productRoute.js";
import profileRoute from "./routes/profileRoute.js";
import sellerRoute from "./routes/sellerRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";

dotenv.config({ path: "./.env" });

const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
const stripeKey = process.env.STRIPE_KEY || "";

connectDB(mongoURI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
export const stripe = new Stripe(stripeKey);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.get("/", (req, res) => {
  res.status(200).send("API IS LIVE");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/seller", sellerRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
