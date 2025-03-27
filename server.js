import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./model/User.js";
import nodemailer from "nodemailer";
import Blog from "./model/Blog.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

//  Register User API
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if User Exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }

    // Create New User
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

//  Login User API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password!" });
    }

    res.json({ success: true, message: "Login successful!", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
//// change password
app.put("/api/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // ✅ User find karo
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User Not Found" });
    }

    if (user.password !== oldPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Old Password is Wrong" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password Changed Successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.delete("/api/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

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

//  Fetch All Users API
app.get("/api/users", async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query);
    res.json({ success: true, users, message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
//  Fetch All Blogs API
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json({ success: true, blogs, message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
//  Fetch Blog by id API
app.get("/api/blog/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, blog, message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/api/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required!" });
  }

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New Message from ${name}`,
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <h2 style="color: #9854cb; text-align: center;">New Contact Message</h2>
              <p><b>Name:</b> ${name}</p>
              <p><b>Email:</b> ${email}</p>
              <p><b>Message:</b></p>
              <p style="background: #f1f1f1; padding: 10px; border-radius: 5px;">${message}</p>
              <hr>
              <p style="font-size: 12px; color: gray; text-align: center;">This email was sent from your website contact form.</p>
            </div>
          </div>
        `,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Email sending failed!" });
  }
});
// Create Blog API
app.post("/api/create-blog", async (req, res) => {
  try {
    const { title, description, category, image, tags, links } = req.body;

    const blogExists = await Blog.findOne({ title });
    if (blogExists) {
      return res.status(400).json({
        success: false,
        message: "Blog with this title already exists!",
      });
    }

    // Create New Blog
    const newBlog = await Blog.create({
      title,
      description,
      category,
      image,
      tags,
      links,
    });

    res.status(201).json({
      success: true,
      message: "Blog registered successfully!",
      blog: newBlog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
