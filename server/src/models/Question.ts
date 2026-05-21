import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  section: { type: String }, // Links this question to a specific exam section
  
  subject: { type: String },
  topic: { type: String },
  chapter: { type: String },
  text: { type: String, required: true },
  textHindi: { type: String },
  options: [{ type: String, required: true }],
  optionsHindi: [{ type: String }],
  correctOptionIndex: { type: Number, required: true, min: 0 },
  correctOptionIndices: [{ type: Number }],
  marks: { type: Number, required: true, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  explanation: { type: String },
  explanationImage: { type: String },
  explanationVideoUrl: { type: String },
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  imageUrl: { type: String },
  
  questionType: { 
    type: String, 
    enum: ['single-correct', 'multiple-correct', 'true-false', 'match-following', 'assertion-reason', 'paragraph'], 
    default: 'single-correct' 
  },
  estimatedSolveTime: { type: Number, default: 60 },
  status: { type: String, enum: ['active', 'draft'], default: 'active' },
  tags: [{ type: String }],
  faculty: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  
  paragraphText: { type: String },
  matchPairs: [{
    left: { type: String },
    right: { type: String }
  }],
  assertion: { type: String },
  reason: { type: String }
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
