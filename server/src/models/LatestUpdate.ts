import mongoose from 'mongoose';

const latestUpdateSchema = new mongoose.Schema({
  text: { type: String, required: false },
  link: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

latestUpdateSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('LatestUpdate', latestUpdateSchema);
