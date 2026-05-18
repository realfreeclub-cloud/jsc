import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: false },
  description: { type: String },
  fileUrl: { type: String, required: false },
  fileType: { type: String }, // e.g., 'pdf', 'doc'
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional, if linked to a course
  category: { type: String },
  isFree: { type: Boolean, default: true },
  downloads: { type: Number, default: 0 }
}, { timestamps: true });

studyMaterialSchema.index({ course: 1 });
studyMaterialSchema.index({ isFree: 1 });

export default mongoose.model('StudyMaterial', studyMaterialSchema);
