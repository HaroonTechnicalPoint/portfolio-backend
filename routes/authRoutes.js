import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/User.js"; // Import User model

dotenv.config();
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if User Already Exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create New User
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password!" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const verifyToken = (req, res, next) => {
  const token = req.header("x-Auth");
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access Denied. No Token Provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid Token" });
  }
};
// 🔹 CHANGE PASSWORD API
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User Not Found" });
    }

    // Check Old Password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old Password is Incorrect" });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, user, message: "Password Changed Successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 🔹 DELETE USER API
router.delete("/user/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
