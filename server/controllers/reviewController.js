import mongoose from "mongoose";
import { Order } from "../model/order.js";
import { Review } from "../model/review.js";
import { Product } from "../model/product.js";

const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user;
    const productId = req.params.userId;

    if (userId === productId) {
      return res.status(400).json({
        success: false,
        message: "You cannot review your own product",
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

    const review = await Review.create({
      productId,
      userId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.log(error);
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
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const [reviews, totalReviews, totalRatings, totalStarsGroup] =
      await Promise.all([
        Review.find({ productId: productObjectId })
          .populate("userId", "name -_id")
          .sort({ createdAt: -1 }),

        Review.countDocuments({ productId: productObjectId }),

        Review.aggregate([
          { $match: { productId: productObjectId } },
          { $group: { _id: null, totalRating: { $avg: "$rating" } } },
        ]),

        Review.aggregate([
          { $match: { productId: productObjectId } },
          { $group: { _id: "$rating", count: { $sum: 1 } } },
          { $sort: { _id: -1 } },
        ]),
      ]);

    const totalRating = totalRatings[0]?.totalRating;

    const formattedTotalRating =
      totalRating !== null && totalRating !== undefined
        ? totalRating.toFixed(2)
        : "0.00";

    const starGroups = [5, 4, 3, 2, 1].map((star) => {
      const found = totalStarsGroup.find((group) => group._id === star);
      return { star, count: found ? found.count : 0 };
    });

    const stats = {
      reviews,
      totalReviews,
      totalRatings: formattedTotalRating,
      totalStarsGroup: starGroups,
    };

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error,
    });
  }
};

const getMyProductReview = async (req, res) => {
  try {
    const sellerId = req.user;

    const products = await Product.find({ seller: sellerId });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for this seller",
      });
    }

    const productIds = products.map((product) => product._id);
    const reviews = await Review.find({
      productId: { $in: productIds },
    }).populate("userId", "name");

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching reviews",
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

export { createReview, deleteReview, getProductReviews, getMyProductReview };
