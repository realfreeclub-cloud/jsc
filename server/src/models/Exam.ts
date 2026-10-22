import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false },
  paperSet: { type: mongoose.Schema.Types.ObjectId, ref: 'PaperSet', required: false },
  durationMinutes: { type: Number, required: true, default: 60 },
  totalMarks: { type: Number, required: true, default: 0 },
  passingMarks: { type: Number, required: true, default: 0 },
  negativeMarking: { type: Number, default: 0 },
  attemptsAllowed: { type: Number, default: 1 }, // 0 or large number for unlimited attempts
  shuffleQuestions: { type: Boolean, default: false },
  shuffleOptions: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Access and Pricing configurations
  accessType: { type: String, enum: ['free', 'paid'], default: 'free' },
  pricing: { type: Number, default: 0 },
  discountedPrice: { type: Number, default: 0 },
  whatsappEnrollmentMessage: { 
    type: String, 
    default: 'Hello Sir, I want to purchase this Test Series:\n\n• Student Name: [name]\n• Test Series: [title]\n• Price: [price]\n• Email: [email]\n\nSir, I want to purchase this. Please share the payment details to activate my access.' 
  },
  whatsappNumber: { type: String, default: '919450614241' },
  accessDuration: { type: Number }, // in days
  expiryDate: { type: Date }, // fixed expiry date
  
  // Section-wise test structure
  sections: [{
    name: { type: String, required: true },
    description: { type: String },
    marksPerQuestion: { type: Number }
  }]
}, { timestamps: true });

// Auto-populate course and paperSet when querying exams
examSchema.pre(/^find/, function (this: any) {
  this.populate('course', 'title _id')
      .populate('paperSet', 'title _id');
});

export default mongoose.model('Exam', examSchema);
