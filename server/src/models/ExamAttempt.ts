import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOptionIndex: { type: Number, required: true } // -1 if not answered
}, { _id: false });

const examAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date }
}, { timestamps: true });

examAttemptSchema.pre(/^find/, function (this: any) {
  this.populate('exam', 'title totalMarks durationMinutes');
});

export default mongoose.model('ExamAttempt', examAttemptSchema);
