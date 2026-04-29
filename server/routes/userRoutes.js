const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
//const upload = require('../config/multer.config');
const uploadFiles  = require('../config/multer.config');
const { protect } = require('../middlewares/auth.middleware');

const userProfileUpload = uploadFiles({
  folder: 'profiles',
  fields: [
    { name: 'profile', maxCount: 1 },
  ]
});


router.post('/google-signin', userController.googleSignIn);
router.post('/', protect, userController.createUser);
router.get('/',protect, userController.getAllUsers);
router.get('/:id',protect, userController.getUserById);
router.put('/:id', protect,userController.updateUser);
router.patch('/:id/upload-profile',protect,uploadFiles({
  folder: 'profiles',
  fields: [
    { name: 'profile', maxCount: 1 },
  ]
}), userController.updateProfile);
router.delete('/:id', protect,userController.deleteUser);

module.exports = router;
