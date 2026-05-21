import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOptionIndex: { type: Number, required: true }, // -1 if not answered (for single correct)
  selectedOptionIndices: [{ type: Number }], // for multiple correct choice
  textAnswer: { type: String } // for typed / text answers
}, { _id: false });

const examAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  skippedAnswers: { type: Number, default: 0 },
  timeSpentSeconds: { type: Number, default: 0 },
  isPassed: { type: Boolean, default: false },
  antiCheatViolations: { type: Number, default: 0 },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date }
}, { timestamps: true });

examAttemptSchema.pre(/^find/, function (this: any) {
  this.populate('exam', 'title totalMarks durationMinutes passingMarks negativeMarking attemptsAllowed shuffleQuestions shuffleOptions');
});

export default mongoose.model('ExamAttempt', examAttemptSchema);
