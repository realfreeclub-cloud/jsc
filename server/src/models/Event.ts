import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String },
  banner: { type: String },
  registrationLink: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

eventSchema.index({ date: 1 });

export default mongoose.model('Event', eventSchema);
