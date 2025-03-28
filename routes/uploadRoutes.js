import express from "express";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded!" });
    }

    const file = req.files.image;

    // ✅ Upload File to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "blog-images",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    fs.unlinkSync(file.tempFilePath);

    res.json({
      success: true,
      message: "Image uploaded successfully!",
      image: result.secure_url,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
