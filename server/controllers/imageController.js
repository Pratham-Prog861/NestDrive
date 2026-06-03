import fs from 'fs';
import path from 'path';
import { uploadToCloudinary, isCloudinaryConfigured, cloudinary } from '../config/cloudinary.js';
import Image from '../models/Image.js';
import Folder from '../models/Folder.js';

// Ensure uploads folder exists for local fallback
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper: Extract public ID from Cloudinary URL
const getCloudinaryPublicId = (url) => {
  try {
    // Cloudinary URLs look like: https://res.cloudinary.com/cloud-name/image/upload/v12345/folder/filename.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1]; // e.g. "v12345/folder/filename.jpg" or "folder/filename.jpg"
    const pathParts = pathAfterUpload.split('/');
    // Remove version (e.g. "v12345") if present
    if (pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1))) {
      pathParts.shift();
    }
    const publicIdWithExtension = pathParts.join('/'); // e.g. "folder/filename.jpg"
    const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
    if (lastDotIndex === -1) return publicIdWithExtension;
    return publicIdWithExtension.substring(0, lastDotIndex); // e.g. "folder/filename"
  } catch (error) {
    console.error('Error parsing Cloudinary URL public ID:', error);
    return null;
  }
};

// @desc    Upload an image
// @route   POST /api/images
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { folderId } = req.body;
    const targetFolderId = folderId === 'root' || !folderId ? null : folderId;

    // Verify folder exists if parent is not root
    if (targetFolderId) {
      const folder = await Folder.findOne({ _id: targetFolderId, userId: req.user.id });
      if (!folder) {
        return res.status(404).json({ message: 'Target folder not found' });
      }
    }

    let imageUrl = '';
    const name = req.file.originalname;
    const size = req.file.size;
    let uploadedToCloud = false;

    if (isCloudinaryConfigured) {
      try {
        // Upload to Cloudinary using stream
        const result = await uploadToCloudinary(req.file.buffer, 'nestdrive');
        imageUrl = result.secure_url;
        uploadedToCloud = true;
      } catch (cloudError) {
        console.warn('Cloudinary upload failed (checking credentials/network). Falling back to local storage:', cloudError.message);
      }
    }

    if (!uploadedToCloud) {
      // Local fallback storage
      const filename = `${Date.now()}-${name.replace(/\s+/g, '-')}`;
      const localFilePath = path.join(uploadDir, filename);
      
      // Write buffer to local folder
      await fs.promises.writeFile(localFilePath, req.file.buffer);
      
      // Generate serving URL
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    }

    const newImage = await Image.create({
      name,
      imageUrl,
      size,
      folderId: targetFolderId,
      userId: req.user.id,
    });

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an image
// @route   DELETE /api/images/:imageId
// @access  Private
export const deleteImage = async (req, res) => {
  const { imageId } = req.params;

  try {
    const image = await Image.findOne({ _id: imageId, userId: req.user.id });
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Try deleting from cloud or disk
    if (isCloudinaryConfigured && image.imageUrl.includes('cloudinary.com')) {
      const publicId = getCloudinaryPublicId(image.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } else if (image.imageUrl.includes('/uploads/')) {
      // Local file cleanup
      const filename = image.imageUrl.split('/uploads/')[1];
      const localFilePath = path.join(uploadDir, filename);
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
      }
    }

    await Image.deleteOne({ _id: imageId });
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Global search folders and images
// @route   GET /api/search
// @access  Private
export const searchDrive = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ folders: [], images: [] });
  }

  try {
    // Search folders (case-insensitive regex)
    const folders = await Folder.find({
      userId: req.user.id,
      name: { $regex: q, $options: 'i' },
    });

    // Search files (case-insensitive regex)
    const images = await Image.find({
      userId: req.user.id,
      name: { $regex: q, $options: 'i' },
    });

    res.json({ folders, images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
