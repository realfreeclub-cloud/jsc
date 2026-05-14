import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseCategory', required: true },
  faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
  mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], required: true },
  imageUrl: { type: String },
  demoVideoUrl: { type: String },
  duration: { type: String },
  language: { type: String },
  studentsEnrolled: { type: Number, default: 0 },
  about: { type: String },
  syllabus: [{ title: String, lessons: Number }],
  isActive: { type: Boolean, default: true },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, { timestamps: true });

// Indexes removed to prevent mongoose warnings (already handled by unique: true and ref)

export default mongoose.model('Course', courseSchema);
