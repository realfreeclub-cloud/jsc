import mongoose from 'mongoose';

const demoSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnailUrl: { type: String },
  videoUrl: { type: String }, // YouTube Preview / Recorded class URL
  faculty: { type: String },
  subject: { type: String },
  scheduleDate: { type: Date },
  durationMinutes: { type: Number, default: 60 },
  isLive: { type: Boolean, default: false }, // true = upcoming live class
  isPublished: { type: Boolean, default: true },
  whatsappGroupLink: { type: String },
  registrationsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('DemoSession', demoSessionSchema);
