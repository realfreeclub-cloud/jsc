import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: false },
  slug: { type: String, required: false, unique: true },
  subtitle: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseCategory', required: false },
  faculty: { type: String, default: 'Expert Faculty' },
  mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], required: false },
  imageUrl: { type: String },
  demoVideoUrl: { type: String },
  duration: { type: String },
  language: { type: String },
  studentsEnrolled: { type: String },
  about: { type: String },
  highlights: [{ type: String }],
  features: [{ type: String }],
  suitableFor: [{ type: String }],
  states: [{ type: String }],
  fees: {
    online: { type: String },
    offline: { type: String },
    hybrid: { type: String }
  },
  note: { type: String },
  syllabus: [{ title: String, lessons: Number }],
  isActive: { type: Boolean, default: true },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, { timestamps: true });

// Indexes removed to prevent mongoose warnings (already handled by unique: true and ref)

courseSchema.pre(/^find/, async function (this: any) {
  this.populate('category');
});

export default mongoose.model('Course', courseSchema);
