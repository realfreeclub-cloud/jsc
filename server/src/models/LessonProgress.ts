import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed: { type: Boolean, default: false },
  watchProgress: { type: Number, default: 0 }, // progress in seconds or percentage
  lastWatchedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique index for user and lesson combo
lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export default mongoose.model('LessonProgress', lessonProgressSchema);
