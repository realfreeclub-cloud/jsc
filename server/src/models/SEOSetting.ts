import mongoose from 'mongoose';

const seoSettingSchema = new mongoose.Schema({
  pageUrl: { type: String, required: false, unique: true },
  metaTitle: { type: String, required: false },
  metaDescription: { type: String },
  keywords: { type: String },
  canonicalUrl: { type: String },
  ogImage: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('SEOSetting', seoSettingSchema);
