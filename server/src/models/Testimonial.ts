import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  studentName: { type: String, required: false },
  courseName: { type: String },
  content: { type: String, required: false },
  avatar: { type: String },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
