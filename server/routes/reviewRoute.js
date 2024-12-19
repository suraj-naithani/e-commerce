import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createReview,
  deleteReview,
  getProductReviews,
} from "../controllers/reviewController.js";

const app = express.Router();

app.get("/:productId", getProductReviews);

app.use(isAuthenticated);

app.post("/addReview", createReview);

app.delete("/:reviewId", deleteReview);

export default app;
