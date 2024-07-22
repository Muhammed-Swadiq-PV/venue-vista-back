// src/middleware/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

// Define file filter (optional)
const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only certain file types (optional)
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Initialize multer with the storage and filter settings
export const upload = multer({ 
  storage,
  fileFilter,
});
