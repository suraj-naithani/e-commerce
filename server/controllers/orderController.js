import mongoose from "mongoose";
import { Order } from "../model/order.js";
import { User } from "../model/user.js";
import {
  getOrderConfirmationEmailTemplate,
  getOrderStatusEmailTemplate,
} from "../utils/email.js";
import { reduceStock, sendEmail } from "../utils/features.js";
import { stripe } from "../index.js";

const newOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const {
      shippingInfo,
      shippingCharges,
      discount,
      total,
      orderItems,
      productId,
      sellerId,
    } = req.body;

    if (req.user === sellerId) {
      return res.status(403).json({
        success: false,
        message: "You cannot place order for your own product",
      });
    }

    if (!shippingInfo || !total || !orderItems) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or invalid order items",
      });
    }

    const order = await Order.create({
      shippingInfo,
      user: req.user,
      shippingCharges,
      discount,
      total,
      orderItems,
      productId,
      sellerId,
    });

    await reduceStock(orderItems);

    const emailSubject = `Your Order Confirmation - Order #${order._id}`;
    const { text, html } = getOrderConfirmationEmailTemplate({
      shippingInfo,
      total,
      orderItems,
    });

    sendEmail({
      to: user.email,
      subject: emailSubject,
      text,
      html,
    }).catch((err) => console.error("Order confirmation email failed:", err));

    return res
      .status(201)
      .json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Order not placed" });
  }
};

const myOrders = async (req, res) => {
  try {
    const userId = req.user;
    let orders = [];

    orders = await Order.find({ user: userId });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.json({ success: false, message: "Order not found" });
  }
};

const allOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      sellerId: req.user,
    }).populate("user", "name email phone address");

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders" });
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const orderId = new mongoose.Types.ObjectId(req.params.id);
    const order = await Order.findById(orderId).populate("user", "email");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch order" });
  }
};

const processOrder = async (req, res) => {
  try {
    const orderId = new mongoose.Types.ObjectId(req.params.id);

    const order = await Order.findById(orderId).populate("user", "email");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message:
          "Order has already been delivered. No further changes can be made.",
      });
    }

    const statusFlow = ["Processing", "Shipped", "Delivered"];
    const currentIndex = statusFlow.indexOf(order.status);

    const nextStatus =
      currentIndex === -1 || currentIndex === statusFlow.length - 1
        ? statusFlow[0]
        : statusFlow[currentIndex + 1];

    order.status = nextStatus;
    await order.save();

    if (nextStatus === "Shipped" || nextStatus === "Delivered") {
      const emailSubject = `Your Order has been ${nextStatus}`;
      const { text, html } = getOrderStatusEmailTemplate({
        orderId,
        status: nextStatus,
        shippingInfo: order.shippingInfo,
        total: order.total,
        orderItems: order.orderItems,
      });

      const recipientEmail =
        order?.user?.email ||
        (await User.findById(order.user).select("email"))?.email;

      if (!recipientEmail) {
        return res.status(400).json({
          success: false,
          message: "Customer email not found for this order",
        });
      }

      sendEmail({
        to: recipientEmail,
        subject: emailSubject,
        text,
        html,
      }).catch((err) => console.error("Order status email failed:", err));
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${nextStatus}`,
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to process order",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = new mongoose.Types.ObjectId(req.params.id);
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    return res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete order" });
  }
};

const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, description, customerName, customerEmail, shippingInfo } =
      req.body;

    if (!amount) {
      return res
        .status(400)
        .json({ success: true, message: "Please enter amount" });
    }

    if (
      !customerName ||
      !shippingInfo?.address ||
      !shippingInfo?.city ||
      !shippingInfo?.state ||
      !shippingInfo?.country ||
      !shippingInfo?.pinCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name and complete address are required for India export payments",
      });
    }

    const countryCode =
      shippingInfo.country?.toLowerCase() === "india"
        ? "IN"
        : shippingInfo.country;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
      description:
        description?.trim() || "E-commerce order payment (India export)",
      receipt_email: customerEmail || undefined,
      shipping: {
        name: customerName,
        address: {
          line1: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postal_code: String(shippingInfo.pinCode),
          country: countryCode,
        },
      },
      metadata: {
        source: "web_checkout",
      },
    });

    return res
      .status(201)
      .json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

export {
  newOrder,
  myOrders,
  allOrders,
  getSingleOrder,
  processOrder,
  deleteOrder,
  createPaymentIntent,
};
