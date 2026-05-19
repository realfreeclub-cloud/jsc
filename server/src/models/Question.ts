import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true, min: 0 }, // 0 to options.length - 1
  marks: { type: Number, required: true, default: 1 }
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
