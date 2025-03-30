import express from "express";
import Blog from "../model/Blog.js";
const router = express.Router();
// Create Blog API
router.post("/create-blog", async (req, res) => {
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
//  Fetch All Blogs API
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json({ success: true, blogs, message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

//  delete Blog by id API
router.delete("/blog/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.deleteOne(id);
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
