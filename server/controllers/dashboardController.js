import moment from "moment";
import mongoose from "mongoose";
import { Order } from "../model/order.js";
import { Product } from "../model/product.js";
import { User } from "../model/user.js";
import { Cart } from "../model/cart.js";

const sellerDashboard = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user);

    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    const lastSixDays = Array.from({ length: 7 }).map((_, i) =>
      moment()
        .subtract(6 - i, "days")
        .startOf("day")
        .toDate()
    );

    const last12Months = Array.from({ length: 12 }).map((_, i) =>
      moment()
        .subtract(11 - i, "months")
        .startOf("month")
    );

    const [
      totalOrder,
      todayOrder,
      totalEarnings,
      todayEarnings,
      weeklyEarning,
      monthlyEarnings,
    ] = await Promise.all([
      Order.countDocuments({
        sellerId: sellerId,
        status: "Delivered",
      }),

      Order.countDocuments({
        sellerId: sellerId,
        status: "Delivered",
        createdAt: { $gte: todayStart, $lt: todayEnd },
      }),

      Order.aggregate([
        {
          $match: {
            sellerId: sellerId,
            status: "Delivered",
          },
        },
        {
          $group: {
            _id: null,
            earning: { $sum: "$total" },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            sellerId: sellerId,
            status: "Delivered",
            createdAt: { $gte: todayStart, $lt: todayEnd },
          },
        },
        { $group: { _id: null, earning: { $sum: "$total" } } },
      ]),

      Order.aggregate([
        {
          $match: {
            sellerId: sellerId,
            status: "Delivered",
            createdAt: {
              $gte: moment().subtract(6, "days").startOf("day").toDate(),
            },
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            total: { $sum: "$total" },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            sellerId: sellerId,
            status: "Delivered",
            createdAt: {
              $gte: moment().subtract(11, "months").startOf("month").toDate(),
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            total: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const totalEarning =
      totalEarnings.length > 0 ? totalEarnings[0].earning : 0;

    const todayEarning =
      todayEarnings.length > 0 ? todayEarnings[0].earning : 0;

    const weeklyEarningsArray = lastSixDays.map((date) => {
      const earning = weeklyEarning.find((e) =>
        moment({
          year: e._id.year,
          month: e._id.month - 1,
          day: e._id.day,
        }).isSame(date, "day")
      );
      return earning ? earning.total : 0;
    });

    const monthlyEarningsArray = last12Months.map((month) => {
      const earning = monthlyEarnings.find(
        (e) => e._id.year === month.year() && e._id.month === month.month() + 1
      );
      return earning ? earning.total : 0;
    });

    const stats = {
      totalOrder,
      todayOrder,
      totalEarning,
      todayEarning,
      weeklyDayEarnings: weeklyEarningsArray,
      monthlyEarnings: monthlyEarningsArray,
    };

    return res.status(201).json({
      success: true,
      message: "Dashboard Stats",
      stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in getting user profile",
      error,
    });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const lastSixDays = Array.from({ length: 7 }).map((_, i) =>
      moment()
        .subtract(6 - i, "days")
        .startOf("day")
        .toDate()
    );

    const last12Months = Array.from({ length: 12 }).map((_, i) =>
      moment()
        .subtract(11 - i, "months")
        .startOf("month")
    );

    const [
      totalProduct,
      totalUser,
      totalSeller,
      totalEarnings,
      weeklyEarning,
      monthlyEarnings,
      products,
      allOrder,
      categories,
      abandonedProducts,
    ] = await Promise.all([
      Product.countDocuments(),

      User.countDocuments({ role: "Buyer" }),

      User.countDocuments({ role: "Seller" }),

      Order.aggregate([
        {
          $match: {
            status: "Delivered",
          },
        },
        {
          $group: {
            _id: null,
            earning: { $sum: "$total" },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            status: "Delivered",
            createdAt: {
              $gte: moment().subtract(6, "days").startOf("day").toDate(),
            },
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            total: { $sum: "$total" },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            status: "Delivered",
            createdAt: {
              $gte: moment().subtract(11, "months").startOf("month").toDate(),
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: "$total" },
          },
        },
      ]),

      Product.find().populate("seller", "name email phone address"),

      Order.find()
        .populate("sellerId", "name email phone address")
        .populate("user", "name email phone address"),

      Product.distinct("category"),

      Cart.aggregate([
        {
          $match: {
            createdAt: { $lt: moment().subtract(1, "month").toDate() },
          },
        },
        {
          $unwind: "$items",
        },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$productDetails.name" },
            totalAbandoned: { $sum: "$items.quantity" },
          },
        },
      ]),
    ]);

    const totalEarning =
      totalEarnings.length > 0 ? totalEarnings[0].earning : 0;

    const weeklyEarningsArray = lastSixDays.map((date) => {
      const earning = weeklyEarning.find((e) =>
        moment({
          year: e._id.year,
          month: e._id.month - 1,
          day: e._id.day,
        }).isSame(date, "day")
      );
      return earning ? earning.total : 0;
    });

    const monthlyEarningsArray = last12Months.map((month) => {
      const earning = monthlyEarnings.find(
        (e) => e._id.year === month.year() && e._id.month === month.month() + 1
      );
      return earning ? earning.totalAmount : 0;
    });

    const orderCounts = allOrder.reduce((acc, order) => {
      const productId = order.productId.toString();
      acc[productId] = (acc[productId] || 0) + 1;
      return acc;
    }, {});

    const productsWithStats = products.map((product) => {
      const hitCount = product.hitCount || 0;
      const orderCount = orderCounts[product._id.toString()] || 0;
      const conversionRate = hitCount > 0 ? (orderCount / hitCount) * 100 : 0;

      return {
        ...product.toObject(),
        hitCount,
        orderCount,
        conversionRate: conversionRate.toFixed(2),
      };
    });

    const stats = {
      totalProduct,
      totalUser,
      totalSeller,
      totalEarning,
      weeklyDayEarnings: weeklyEarningsArray,
      monthlyEarnings: monthlyEarningsArray,
      products: productsWithStats,
      allOrder,
      categories,
      abandonedProducts,
    };

    return res.status(201).json({
      success: true,
      message: "Dashboard Stats",
      stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in getting admin dashboard data",
      error,
    });
  }
};

export { adminDashboard, sellerDashboard };
