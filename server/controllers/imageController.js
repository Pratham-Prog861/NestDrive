import { uploadToCloudinary, isCloudinaryConfigured, cloudinary } from '../config/cloudinary.js';
import Image from '../models/Image.js';
import Folder from '../models/Folder.js';

// Helper: Extract public ID from Cloudinary URL
const getCloudinaryPublicId = (url) => {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1];
    const pathParts = pathAfterUpload.split('/');
    if (pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1))) {
      pathParts.shift();
    }
    const publicIdWithExtension = pathParts.join('/');
    const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
    if (lastDotIndex === -1) return publicIdWithExtension;
    return publicIdWithExtension.substring(0, lastDotIndex);
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

    if (!isCloudinaryConfigured) {
      return res.status(500).json({ 
        message: 'Cloudinary is not configured. Please enter valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.' 
      });
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

    const name = req.file.originalname;
    const size = req.file.size;

    // Upload to Cloudinary using stream uploader
    const result = await uploadToCloudinary(req.file.buffer, 'nestdrive');
    const imageUrl = result.secure_url;

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
    res.status(500).json({ message: `Cloudinary upload failed: ${error.message}` });
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

    // Delete from Cloudinary
    if (image.imageUrl.includes('cloudinary.com')) {
      const publicId = getCloudinaryPublicId(image.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
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
    const folders = await Folder.find({
      userId: req.user.id,
      name: { $regex: q, $options: 'i' },
    });

    const images = await Image.find({
      userId: req.user.id,
      name: { $regex: q, $options: 'i' },
    });

    res.json({ folders, images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
