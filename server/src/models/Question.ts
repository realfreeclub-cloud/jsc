import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true, min: 0 }, // 0 to options.length - 1
  marks: { type: Number, required: true, default: 1 },
  explanation: { type: String },
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  imageUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
