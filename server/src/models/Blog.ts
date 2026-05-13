import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnail: { type: String },
  category: { type: String },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, { timestamps: true });

blogSchema.index({ isPublished: 1, publishedAt: -1 });

export default mongoose.model('Blog', blogSchema);
