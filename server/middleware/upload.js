import multer from 'multer';

// Use memory storage to hold file buffer before uploading to Cloudinary or saving to local fallback
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Only accept image mime types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

export default upload;
