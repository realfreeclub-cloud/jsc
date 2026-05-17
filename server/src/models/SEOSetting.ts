import mongoose from 'mongoose';

const seoSettingSchema = new mongoose.Schema({
  pageUrl: { type: String, required: true, unique: true },
  metaTitle: { type: String, required: true },
  metaDescription: { type: String },
  keywords: { type: String },
  canonicalUrl: { type: String },
  ogImage: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('SEOSetting', seoSettingSchema);
