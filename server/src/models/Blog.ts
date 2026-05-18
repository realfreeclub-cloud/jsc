import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: false },
  slug: { type: String, required: false, unique: true },
  content: { type: String, required: false },
  excerpt: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
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
