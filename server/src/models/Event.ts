import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: false },
  slug: { type: String, required: false, unique: true },
  description: { type: String },
  date: { type: Date, required: false },
  location: { type: String },
  banner: { type: String },
  registrationLink: { type: String },
  rsvpCount: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

eventSchema.index({ date: 1 });

export default mongoose.model('Event', eventSchema);
