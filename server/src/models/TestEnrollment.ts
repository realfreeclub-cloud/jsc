import mongoose from 'mongoose';

const testEnrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'rejected', 'expired'], 
    default: 'pending' 
  },
  enrolledAt: { type: Date, default: Date.now },
  activatedAt: { type: Date },
  expiryDate: { type: Date }, // computed based on exam's accessDuration or fixed expiryDate
  isLifetime: { type: Boolean, default: false },
  paymentNotes: { type: String }
}, { timestamps: true });

// Auto populate student and exam details
testEnrollmentSchema.pre(/^find/, function(this: any) {
  this.populate('user', 'name email phone role')
      .populate('exam', 'title accessType pricing discountedPrice durationMinutes totalMarks');
});

export default mongoose.model('TestEnrollment', testEnrollmentSchema);
