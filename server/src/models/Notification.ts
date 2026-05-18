import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: false },
  content: { type: String, required: false },
  type: { type: String, enum: ['info', 'alert', 'success', 'warning'], default: 'info' },
  isPinned: { type: Boolean, default: false },
  expiryDate: { type: Date },
  link: { type: String }
}, { timestamps: true });

notificationSchema.index({ expiryDate: 1 });
notificationSchema.index({ isPinned: -1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
