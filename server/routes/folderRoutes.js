import express from 'express';
import { createFolder, getFolders, getFolderContents, deleteFolder } from '../controllers/folderController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All folder routes require JWT auth
router.use(auth);

router.route('/')
  .get(getFolders)
  .post(createFolder);

router.route('/:folderId')
  .get(getFolderContents)
  .delete(deleteFolder);

export default router;
