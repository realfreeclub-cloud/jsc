import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  durationMinutes: { type: Number, required: true, default: 60 },
  totalMarks: { type: Number, required: true, default: 0 },
  passingMarks: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-populate course name when querying exams
examSchema.pre(/^find/, function (this: any) {
  this.populate('course', 'title _id');
});

export default mongoose.model('Exam', examSchema);
