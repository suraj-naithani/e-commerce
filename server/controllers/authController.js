import { compare } from "bcrypt";
import { User } from "../model/user.js";
import { cookieOptions, sendToken } from "../utils/features.js";

const signUp = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    const exist = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role,
    });

    user.password = undefined;

    sendToken(res, user, 201, "User created successfully");
  } catch (error) {
    res.status(500).send({ success: false, message: "Sign Up failed", error });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return res.status(404).json({
        success: false,
        message: "Invalid password",
      });
    }
    sendToken(res, user, 200, `${user.name} logged in successfully`);
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Error in sign in API", error });
  }
};

const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("e-commerce-token", "", { ...cookieOptions, maxAge: 0 })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "An error occurred while Logging the user",
    });
  }
};

export { signIn, signUp, logout };
