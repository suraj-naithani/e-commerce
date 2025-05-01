import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createReview,
  deleteReview,
  getProductReviews,
  getMyProductReview
} from "../controllers/reviewController.js";

const app = express.Router();

app.use(isAuthenticated);

app.post("/postReview/:userId", createReview);

app.get("/getReview/:productId", getProductReviews);

app.get("/getMyReview", getMyProductReview);

app.delete("/deleteReview/:reviewId", deleteReview);

export default app;
