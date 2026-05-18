import mongoose from 'mongoose';

const courseCategorySchema = new mongoose.Schema({
  name: { type: String, required: false, unique: true },
  slug: { type: String, required: false, unique: true },
  description: { type: String },
  icon: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes removed to prevent mongoose warnings

export default mongoose.model('CourseCategory', courseCategorySchema);
