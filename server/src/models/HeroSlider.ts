import mongoose from 'mongoose';

const heroSliderSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  imageUrl: { type: String, required: false },
  buttonText: { type: String },
  buttonLink: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

heroSliderSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('HeroSlider', heroSliderSchema);
