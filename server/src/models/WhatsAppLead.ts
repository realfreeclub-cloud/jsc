import mongoose from 'mongoose';

const whatsappLeadSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String, required: false },
  message: { type: String },
  sourcePage: { type: String },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new' },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('WhatsAppLead', whatsappLeadSchema);
