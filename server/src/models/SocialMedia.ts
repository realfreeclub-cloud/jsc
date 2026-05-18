import mongoose from 'mongoose';

const socialMediaSchema = new mongoose.Schema({
  platform: { type: String, required: false },
  url: { type: String, required: false },
  icon: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

socialMediaSchema.index({ order: 1 });

export default mongoose.model('SocialMedia', socialMediaSchema);
