import mongoose from 'mongoose';

const seoSettingSchema = new mongoose.Schema({
  pageRoute: { type: String, required: true, unique: true }, // e.g., '/', '/about', '/courses'
  title: { type: String },
  description: { type: String },
  keywords: [{ type: String }],
  ogImage: { type: String }
}, { timestamps: true });

seoSettingSchema.index({ pageRoute: 1 });

export default mongoose.model('SEOSetting', seoSettingSchema);
