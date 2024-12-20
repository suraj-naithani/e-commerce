import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { v4 as uuid } from "uuid";
import { getBase64 } from "../lib/helper.js";
import { Product } from "../model/product.js";

const connectDB = (uri) => {
  mongoose
    .connect(uri, { dbName: "E-comm" })
    .then((data) => {
      console.log(`connect to DB: ${data.connection.host}`);
    })
    .catch((error) => {
      throw error;
    });
};

const uploadFileToCloudinary = async (files = []) => {
  const uploadPromise = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
          transformation: [
            { width: 1000, crop: "scale" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });
  try {
    const result = await Promise.all(uploadPromise);
    const formattedResult = result.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResult;
  } catch (error) {
    throw new Error("Error uploading files to cloudiary", error.message);
  }
};

const deleteFileToCloudinary = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId.trim(), (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res
    .status(code)
    .cookie("e-commerce-token", token, cookieOptions)
    .json({
      success: true,
      message,
      user,
    });
};

const reduceStock = async (orderItems) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];

    const product = await Product.findById(order.productId);

    if (!product) throw new Error("Product not found");

    product.stock -= order.quantity;

    await product.save();
  }
};

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_ID,
      to: to,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    return error;
  }
};

export {
  connectDB,
  cookieOptions,
  deleteFileToCloudinary,
  reduceStock,
  sendToken,
  uploadFileToCloudinary,
  sendEmail,
};
