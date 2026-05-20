import mongoose from 'mongoose';

const questionBankSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true, min: 0 },
  marks: { type: Number, required: true, default: 1 },
  explanation: { type: String },
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  imageUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('QuestionBank', questionBankSchema);
