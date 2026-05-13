import multer from 'multer';

// Keep images in memory for Cloudinary or custom processing
const storage = multer.memoryStorage();

// Validate upload file types (Only Images)
const multerFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default upload;
