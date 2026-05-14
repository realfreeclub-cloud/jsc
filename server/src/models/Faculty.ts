import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  bio: { type: String },
  imageUrl: { type: String },
  experience: { type: String },
  socialLinks: {
    linkedin: String,
    twitter: String
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

facultySchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Faculty', facultySchema);
