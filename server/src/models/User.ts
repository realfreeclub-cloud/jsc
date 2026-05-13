import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['student', 'admin', 'faculty'], default: 'student' },
  avatar: { type: String },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  savedMaterials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyMaterial' }],
  bookmarkedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
}, { timestamps: true });

// Indexes removed to prevent mongoose warnings

export default mongoose.model('User', userSchema);
