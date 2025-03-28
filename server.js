import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import fileUpload from "express-fileupload";
import User from "./model/User.js";
import nodemailer from "nodemailer";
import Blog from "./model/Blog.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(fileUpload({ useTempFiles: true }));

app.use("/api", uploadRoutes);

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
