import mongoose from 'mongoose';

const socialMediaSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

socialMediaSchema.index({ order: 1 });

export default mongoose.model('SocialMedia', socialMediaSchema);
