import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Image name is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    size: {
      type: Number,
      required: [true, 'Image size is required'], // Size in bytes
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null, // Null means stored in the root directory
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  { timestamps: true }
);

// Index for fast isolation and folder contents lookup
imageSchema.index({ userId: 1, folderId: 1 });

const Image = mongoose.model('Image', imageSchema);
export default Image;
