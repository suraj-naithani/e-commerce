import mongoose from "mongoose";
import { Order } from "../model/order.js";
import { User } from "../model/user.js";
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
    const emailBody = `
    Hi,

    Thank you for shopping with us! Your order has been confirmed and is now being processed.

    **Order Details**
    Address: ${shippingInfo.address}, ${shippingInfo.city}, ${
      shippingInfo.state
    }, ${shippingInfo.country} - ${shippingInfo.pinCode}
    Total: ₹${total.toLocaleString()}

    **Order Summary**
    ${orderItems.name} x ${orderItems.quantity} = ${
      orderItems.price * orderItems.quantity
    }

    If you have any questions, contact our support team.

    Regards,
    Your XYZ`;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      text: emailBody,
      html: `<div style="font-family: Arial, sans-serif;">${emailBody.replace(
        /\n/g,
        "<br>"
      )}</div>`,
    });

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
    const order = await Order.findById(orderId);
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

    const order = await Order.findById(orderId);
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
      const emailBody = `
        Hi,

        Your order with Order ID: ${orderId} has been ${nextStatus}. We're excited to update you on the progress of your purchase!

        **Order Details**
        - Address: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${
        order.shippingInfo.state
      }, ${order.shippingInfo.country} - ${order.shippingInfo.pinCode}
        - Total: ₹${order.total.toLocaleString()}

        **Order Summary**
       ${order.orderItems.name} x ${order.orderItems.quantity} = ${
        order.orderItems.price * order.orderItems.quantity
      }

        If you have any questions or need assistance, feel free to contact our support team.

        Regards,
        Your XYZ`;

      await sendEmail({
        to: process.env.MY_GMAIL_ID,
        subject: emailSubject,
        text: emailBody,
        html: `<div style="font-family: Arial, sans-serif;">${emailBody.replace(
          /\n/g,
          "<br>"
        )}</div>`,
      });
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
    const { amount } = req.body;

    if (!amount) {
      return res
        .status(400)
        .json({ success: true, message: "Please enter amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
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
