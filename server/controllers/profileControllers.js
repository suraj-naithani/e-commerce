import { hash, hashSync } from "bcrypt";
import { User } from "../model/user.js";
import { Cart } from "../model/cart.js";
import { Order } from "../model/order.js";
import { Product } from "../model/product.js";
import { Review } from "../model/review.js";

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user);

    if (!user)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });

    return res.status(201).json({ success: true, user });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in getting user profile",
      error,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user;
    const { name, email, phone, address, password } = req.body;

    const emailExist = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const phoneExist = await User.findOne({ phone, _id: { $ne: userId } });
    if (phoneExist) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    const updates = {
      name,
      email,
      phone,
      address,
    };

    if (password && password.trim()) {
      updates.password = await hash(password, 10);
    }

    Object.keys(updates).forEach((key) => {
      if (!updates[key]) delete updates[key];
    });

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error,
    });
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const userId = req.user;

    await Order.deleteMany({ user: userId });

    await Cart.deleteOne({ userId });

    const userProducts = await Product.find({ seller: userId });
    for (const product of userProducts) {
      await Review.deleteMany({ productId: product._id });
    }
    await Product.deleteMany({ seller: userId });

    await Review.deleteMany({ userId });

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message:
        "Your profile and all related data have been deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while deleting your profile. Please try again later.",
    });
  }
};

export default deleteMyProfile;

export { deleteMyProfile, getMyProfile, updateProfile };
