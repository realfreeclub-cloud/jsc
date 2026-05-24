import mongoose from 'mongoose';

const paperSetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' }]
}, { timestamps: true });

// Auto-populate questions when querying paper sets
paperSetSchema.pre(/^find/, function (this: any) {
  this.populate('questions');
});

export default mongoose.model('PaperSet', paperSetSchema);
