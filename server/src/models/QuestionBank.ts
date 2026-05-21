import mongoose from 'mongoose';

const questionBankSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String },
  chapter: { type: String },
  text: { type: String, required: true },
  textHindi: { type: String }, // Hindi translation of the question text
  options: [{ type: String, required: true }],
  optionsHindi: [{ type: String }], // Hindi translations of the options
  correctOptionIndex: { type: Number, required: true, min: 0 }, // 0-based index for single choice
  correctOptionIndices: [{ type: Number }], // For multiple choice questions
  marks: { type: Number, required: true, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  explanation: { type: String },
  explanationImage: { type: String }, // Explanatory image URL
  explanationVideoUrl: { type: String }, // Explanatory video URL (YouTube, Vimeo, etc.)
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  imageUrl: { type: String }, // Question image/diagram URL
  
  // Advanced Question Metadata
  questionType: { 
    type: String, 
    enum: ['single-correct', 'multiple-correct', 'true-false', 'match-following', 'assertion-reason', 'paragraph'], 
    default: 'single-correct' 
  },
  estimatedSolveTime: { type: Number, default: 60 }, // in seconds
  status: { type: String, enum: ['active', 'draft'], default: 'active' },
  tags: [{ type: String }],
  faculty: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  
  // Specific Type Layout Fields
  paragraphText: { type: String }, // For paragraph-based questions
  matchPairs: [{
    left: { type: String },
    right: { type: String }
  }], // For Match the Following
  assertion: { type: String }, // For Assertion/Reason
  reason: { type: String } // For Assertion/Reason
}, { timestamps: true });

export default mongoose.model('QuestionBank', questionBankSchema);
