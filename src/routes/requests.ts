import { Router } from 'express';
import multer from 'multer';
import { submitRequest } from '../controllers/requestsController';
import { requestsThrottle } from '../middleware/throttle';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2* 1024 * 1024, // 2MB limit
    files: 1 // Only one file
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// POST /api/requests - Submit "can't find it?" request
router.post('/', requestsThrottle, upload.single('image'), submitRequest);

export default router;
