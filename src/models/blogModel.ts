/**
 * Purpose
 * -------
 * Stores community-authored blog posts and their associated comments and likes.
 *
 * Relationships
 * - `authorId` is a string reference to the User collection (not an ObjectId ref)
 *   to keep queries simple and avoid populate overhead on list views.
 * - Comments are embedded directly rather than in a separate collection because
 *   comment volume per post is expected to stay small, and embedding avoids
 *   an extra round-trip to render a post with its comments.
 *
 * Business Rules
 * - `likes` is an array of user ID strings — checking membership (`includes`)
 *   determines whether the current user has liked a post. The UI uses this
 *   to toggle the like button without a separate API call.
 * - Blog content (`content`) stores raw HTML from the rich-text editor.
 *   Rendering must sanitize this field to prevent stored XSS.
 * - The `delete mongoose.models.blogs` guard prevents OverwriteModelError
 *   during hot-reload. Note the lowercase collection name "blogs" is intentional
 *   (matches the existing MongoDB collection).
 *
 * TODO: Add a text index on `title` and `content` to support full-text search,
 * and paginate the blogs list endpoint — returning all documents will degrade
 * as post count grows.
 */

import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const blogSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  content: { type: String, required: true },
  coverImage: { type: String },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  link: { type: String },
  likes: [{ type: String }], // Array of user IDs who liked
  comments: [commentSchema],
});

if (mongoose.models.blogs) {
  delete mongoose.models.blogs;
}

const Blog = mongoose.models.blogs || mongoose.model("blogs", blogSchema);
export default Blog;
