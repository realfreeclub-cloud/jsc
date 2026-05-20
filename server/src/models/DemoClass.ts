import mongoose from 'mongoose';

const demoClassSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String },
  phone: { type: String, required: false },
  courseInterest: { type: String },
  scheduleDate: { type: Date },
  demoSession: { type: mongoose.Schema.Types.ObjectId, ref: 'DemoSession' },
  status: { type: String, enum: ['pending', 'scheduled', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('DemoClass', demoClassSchema);
