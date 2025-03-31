import express from "express";
import Blog from "../model/Blog.js";
import Category from "../model/Category.js";
const router = express.Router();
// Create Blog API
router.post("/create-blog", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      images,
      tags,
      links,
      author,
      authProfile,
    } = req.body;
    const blogExists = await Blog.findOne({ title });
    if (blogExists) {
      return res.status(400).json({
        success: false,
        message: "Blog with this title already exists!",
      });
    }
    const existingCategory = await Category.findById(category);

    // Create New Blog
    const newBlog = await Blog.create({
      title,
      description,
      category: existingCategory,
      images,
      tags,
      author,
      authProfile,
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
//  Fetch All Blogs API
router.get("/blogs/:lastId", async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    let query = {};
    if (search) {
      query = { title: { $regex: search, $options: "i" } };
    }
    const totalBlogs = await Blog.countDocuments();
    const totalPage = Math.ceil(totalBlogs / limit);

    const categories = await Blog.find()
      .skip((page - 1) * limit) // Skip previous pages
      .limit(limit); // Limit the number of records

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      blogs,
      count: { totalPage, currentPage: page },
      message: "Success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

//  delete Blog by id API
router.delete("/blog/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, message: "Blog delete Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Update Blog by ID API
router.put("/blog/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    category,
    authProfile,
    author,
    images,
    tags,
    links,
  } = req.body;

  try {
    const existingCategory = await Category.findById(category);

    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category: existingCategory,
        images,
        status,
        authProfile,
        author,
        tags,
        links,
      },
      { new: true }
    );

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, blog, message: "Blog Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

//  Fetch Blog by id API
router.get("/blog/:id", async (req, res) => {
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

export default router;
