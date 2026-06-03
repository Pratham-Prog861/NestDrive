import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({ override: true });

console.log('--- DBG CLOUDINARY CONFIG ---');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'undefined');
console.log('-----------------------------');

const isCloudinaryConfigured = 
  !!(process.env.CLOUDINARY_CLOUD_NAME && 
     process.env.CLOUDINARY_API_KEY && 
     process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary storage helper initialized.');
} else {
  console.warn('WARNING: Cloudinary env variables not set. Image uploads will use local folder fallback.');
}

/**
 * Uploads a file buffer to Cloudinary using stream.
 * @param {Buffer} fileBuffer - The file buffer from multer.
 * @param {string} folder - Destination folder on Cloudinary.
 * @returns {Promise<object>}
 */
export const uploadToCloudinary = (fileBuffer, folder = 'nestdrive') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      return reject(new Error('Cloudinary is not configured'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export { cloudinary, isCloudinaryConfigured };
