import express from 'express';
import { uploadImage, deleteImage } from '../controllers/imageController.js';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All image routes require authentication
router.use(auth);

// POST /api/images - Upload file (expects 'file' form field)
router.post('/', upload.single('file'), uploadImage);

// DELETE /api/images/:imageId - Delete image
router.delete('/:imageId', deleteImage);

export default router;
