import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Object, required: true },
    images: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    author: { type: String },
    authProfile: { type: String },
    tags: [{ type: String }],
    links: [{ type: String }],
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default Blog;
