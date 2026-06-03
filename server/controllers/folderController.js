import Folder from '../models/Folder.js';
import Image from '../models/Image.js';

// Helper: Calculate sizes for all folders of a user in O(N) memory complexity
const getFolderSizesMap = async (userId) => {
  const folders = await Folder.find({ userId });
  const images = await Image.find({ userId });

  // Initialize size map with 0 for all folders
  const sizesMap = {};
  folders.forEach((f) => {
    sizesMap[f._id.toString()] = 0;
  });

  // Helper map to quickly lookup folder parent
  const parentMap = {};
  folders.forEach((f) => {
    parentMap[f._id.toString()] = f.parentFolder ? f.parentFolder.toString() : null;
  });

  // Accumulate image sizes to their folder and all ancestors
  images.forEach((img) => {
    if (img.folderId) {
      let currentId = img.folderId.toString();
      // Propagate the image size up the folder hierarchy tree
      while (currentId && sizesMap[currentId] !== undefined) {
        sizesMap[currentId] += img.size;
        currentId = parentMap[currentId];
      }
    }
  });

  return sizesMap;
};

// Helper: Construct breadcrumbs path from folder up to root
const getBreadcrumbs = async (folderId, userId) => {
  const breadcrumbs = [];
  let currentId = folderId;

  while (currentId) {
    const folder = await Folder.findOne({ _id: currentId, userId });
    if (!folder) break;
    breadcrumbs.unshift({
      id: folder._id,
      name: folder.name,
    });
    currentId = folder.parentFolder;
  }

  breadcrumbs.unshift({ id: 'root', name: 'My Drive' });
  return breadcrumbs;
};

// @desc    Create a new folder
// @route   POST /api/folders
// @access  Private
export const createFolder = async (req, res) => {
  const { name, parentFolder } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // If parentFolder is provided, verify it exists and belongs to the user
    if (parentFolder && parentFolder !== 'root') {
      const parent = await Folder.findOne({ _id: parentFolder, userId: req.user.id });
      if (!parent) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
    }

    const folder = await Folder.create({
      name,
      userId: req.user.id,
      parentFolder: parentFolder === 'root' || !parentFolder ? null : parentFolder,
    });

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all folders with calculated recursive sizes
// @route   GET /api/folders
// @access  Private
export const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user.id });
    const sizesMap = await getFolderSizesMap(req.user.id);

    const foldersWithSizes = folders.map((folder) => {
      const folderObj = folder.toObject();
      folderObj.totalSize = sizesMap[folder._id.toString()] || 0;
      return folderObj;
    });

    res.json(foldersWithSizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get folder details, subfolders, and files
// @route   GET /api/folders/:folderId
// @access  Private
export const getFolderContents = async (req, res) => {
  const { folderId } = req.params;
  const targetId = folderId === 'root' ? null : folderId;

  try {
    let currentFolder = null;
    if (targetId) {
      currentFolder = await Folder.findOne({ _id: targetId, userId: req.user.id });
      if (!currentFolder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
    }

    // Get subfolders in this folder
    const subfolders = await Folder.find({ parentFolder: targetId, userId: req.user.id });
    // Get files in this folder
    const images = await Image.find({ folderId: targetId, userId: req.user.id });

    // Calculate sizes for subfolders
    const sizesMap = await getFolderSizesMap(req.user.id);
    const subfoldersWithSizes = subfolders.map((folder) => {
      const folderObj = folder.toObject();
      folderObj.totalSize = sizesMap[folder._id.toString()] || 0;
      return folderObj;
    });

    // Calculate current folder size
    let currentFolderSize = 0;
    if (targetId) {
      currentFolderSize = sizesMap[targetId.toString()] || 0;
    } else {
      // For root, total size is the sum of all images of this user
      const allImages = await Image.find({ userId: req.user.id });
      currentFolderSize = allImages.reduce((sum, img) => sum + img.size, 0);
    }

    const breadcrumbs = await getBreadcrumbs(targetId, req.user.id);

    res.json({
      folder: currentFolder
        ? { ...currentFolder.toObject(), totalSize: currentFolderSize }
        : { _id: 'root', name: 'My Drive', totalSize: currentFolderSize },
      subfolders: subfoldersWithSizes,
      images,
      breadcrumbs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: Recursively delete folders and their children
const deleteFolderRecursive = async (folderId, userId) => {
  // Find and recursively delete child folders
  const subfolders = await Folder.find({ parentFolder: folderId, userId });
  for (const sub of subfolders) {
    await deleteFolderRecursive(sub._id, userId);
  }

  // Delete all image entries in database (Cloudinary cleanup can be done asynchronously or as a follow up)
  await Image.deleteMany({ folderId, userId });

  // Delete folder itself
  await Folder.deleteOne({ _id: folderId, userId });
};

// @desc    Delete a folder and all its contents recursively
// @route   DELETE /api/folders/:folderId
// @access  Private
export const deleteFolder = async (req, res) => {
  const { folderId } = req.params;

  try {
    const folder = await Folder.findOne({ _id: folderId, userId: req.user.id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found or unauthorized' });
    }

    await deleteFolderRecursive(folderId, req.user.id);
    res.json({ message: 'Folder and all its contents deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
