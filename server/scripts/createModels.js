const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../src/models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const models = {
  'User.ts': `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['student', 'admin', 'faculty'], default: 'student' },
  avatar: { type: String },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  savedMaterials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyMaterial' }],
  bookmarkedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
}, { timestamps: true });

userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
`,
  'CourseCategory.ts': `import mongoose from 'mongoose';

const courseCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

courseCategorySchema.index({ slug: 1 });

export default mongoose.model('CourseCategory', courseCategorySchema);
`,
  'Course.ts': `import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseCategory', required: true },
  faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
  mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], required: true },
  thumbnail: { type: String },
  demoVideoUrl: { type: String },
  duration: { type: String },
  language: { type: String },
  studentsEnrolled: { type: Number, default: 0 },
  about: { type: String },
  syllabus: [{ title: String, lessons: Number }],
  isActive: { type: Boolean, default: true },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, { timestamps: true });

courseSchema.index({ slug: 1 });
courseSchema.index({ category: 1 });

export default mongoose.model('Course', courseSchema);
`,
  'Blog.ts': `import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnail: { type: String },
  category: { type: String },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, { timestamps: true });

blogSchema.index({ slug: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });

export default mongoose.model('Blog', blogSchema);
`,
  'Event.ts': `import mongoose from 'mongoose';

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
`,
  'Notification.ts': `import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['info', 'alert', 'success', 'warning'], default: 'info' },
  isPinned: { type: Boolean, default: false },
  expiryDate: { type: Date },
  link: { type: String }
}, { timestamps: true });

notificationSchema.index({ expiryDate: 1 });
notificationSchema.index({ isPinned: -1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
`,
  'LatestUpdate.ts': `import mongoose from 'mongoose';

const latestUpdateSchema = new mongoose.Schema({
  text: { type: String, required: true },
  link: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

latestUpdateSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('LatestUpdate', latestUpdateSchema);
`,
  'Gallery.ts': `import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String },
  imageUrl: { type: String, required: true },
  category: { type: String, default: 'General' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

gallerySchema.index({ category: 1, order: 1 });

export default mongoose.model('Gallery', gallerySchema);
`,
  'StudyMaterial.ts': `import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileType: { type: String }, // e.g., 'pdf', 'doc'
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional, if linked to a course
  category: { type: String },
  isFree: { type: Boolean, default: true },
  downloads: { type: Number, default: 0 }
}, { timestamps: true });

studyMaterialSchema.index({ course: 1 });
studyMaterialSchema.index({ isFree: 1 });

export default mongoose.model('StudyMaterial', studyMaterialSchema);
`,
  'Testimonial.ts': `import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  courseName: { type: String },
  content: { type: String, required: true },
  avatar: { type: String },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
`,
  'Faculty.ts': `import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  bio: { type: String },
  avatar: { type: String },
  experience: { type: String },
  socialLinks: {
    linkedin: String,
    twitter: String
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

facultySchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Faculty', facultySchema);
`,
  'HeroSlider.ts': `import mongoose from 'mongoose';

const heroSliderSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  imageUrl: { type: String, required: true },
  buttonText: { type: String },
  buttonLink: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

heroSliderSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('HeroSlider', heroSliderSchema);
`,
  'SEOSetting.ts': `import mongoose from 'mongoose';

const seoSettingSchema = new mongoose.Schema({
  pageRoute: { type: String, required: true, unique: true }, // e.g., '/', '/about', '/courses'
  title: { type: String },
  description: { type: String },
  keywords: [{ type: String }],
  ogImage: { type: String }
}, { timestamps: true });

seoSettingSchema.index({ pageRoute: 1 });

export default mongoose.model('SEOSetting', seoSettingSchema);
`
};

for (const [filename, content] of Object.entries(models)) {
  fs.writeFileSync(path.join(modelsDir, filename), content);
  console.log('Created: ' + filename);
}
