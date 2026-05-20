import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String }, // YouTube unlisted link
  pdfUrl: { type: String }, // PDF/attachment url
  order: { type: Number, default: 0 },
  isPreview: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Lesson', lessonSchema);
