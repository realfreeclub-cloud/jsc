import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String },
  imageUrl: { type: String, required: false },
  category: { type: String, default: 'General' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

gallerySchema.index({ category: 1, order: 1 });

export default mongoose.model('Gallery', gallerySchema);
