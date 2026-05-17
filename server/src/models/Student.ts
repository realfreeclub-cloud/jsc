import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, required: true, unique: true },
  course: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active' },
  admissionDate: { type: Date, default: Date.now },
  parentDetails: {
    name: String,
    phone: String
  },
  feesPaid: { type: Number, default: 0 },
  totalFees: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
