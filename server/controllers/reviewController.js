import mongoose from "mongoose";
import { Order } from "../model/order.js";
import { Review } from "../model/review.js";
import { Product } from "../model/product.js";

const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user);
    const existingReview = await Review.findOne({ productId, userId });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    const userOrder = await Order.findOne({
      user: userId,
      productId: productId,
      status: "Delivered",
    });

    if (!userOrder) {
      return res.status(403).json({
        success: false,
        message:
          "You can only review products you have purchased and that are delivered.",
      });
    }

    const review = new Review({
      productId,
      userId,
      rating,
      comment,
    });

    await review.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error adding review",
      error,
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId }).populate("userId", "name");

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const sellerId = req.user;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const product = await Product.findById(review.productId);

    if (!product || product.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review",
      });
    }

    await Review.deleteOne({ _id: reviewId });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting review",
      error,
    });
  }
};

export { createReview, deleteReview, getProductReviews };
