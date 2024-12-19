import { E_COMMERCE_TOKEN } from "../constants/config.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.js";

const isAuthenticated = (req, res, next) => {
  const token = req.cookies[E_COMMERCE_TOKEN];

  if (!token)
    return res.status(401).json({
      success: false,
      message: "Please login to access this",
    });
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decodedData._id;
  next();
};

const isSeller = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (user && user.role === "Seller") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Seller can access.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (user && user.role === "Admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Admin can access.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { isAuthenticated, isSeller, isAdmin };
