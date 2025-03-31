import express from "express";
import Category from "../model/Category.js";
const router = express.Router();

router.post("/category", async (req, res) => {
  try {
    const { name } = req.body;
    const categoryExist = await Category.findOne({ name });
    if (categoryExist) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }
    const newCategory = await Category.create({ name });

    res.status(201).json({
      success: true,
      message: "Category created successfully!",
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
router.get("/category/:lastId", async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Search query
    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: "i" } }; // Case-insensitive search
    }

    const totalCategories = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategories / limit);

    const categories = await Category.find(query)
      .skip((page - 1) * limit) // Skip previous pages
      .limit(limit); // Limit the number of records

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully!",
      categories,
      count: { totalPages, currentPage: page },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.put("/category/:id", async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  try {
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully!",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
router.delete("/category/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
