import { User } from "../model/user.js";
import { hashSync } from "bcrypt";

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

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

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

    if (password) {
      await hashSync(password, 10);
    }

    const updates = {
      name: name || user.name,
      phone: phone || user.phone,
      email: email || user.email,
      address: address || user.address,
      password: password,
    };

    const hasChanges = Object.keys(updates).some(
      (key) => updates[key] !== user[key]
    );

    if (!hasChanges) {
      return res.status(200).json({
        success: false,
        message: "No changes",
      });
    }

    Object.assign(user, updates);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in update API",
      error,
    });
  }
};

export { getMyProfile, updateProfile };
