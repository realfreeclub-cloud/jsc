import mongoose from 'mongoose';

const courseAccessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isLifetime: { type: Boolean, default: false },
  expiryDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('CourseAccess', courseAccessSchema);
