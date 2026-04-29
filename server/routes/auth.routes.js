const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');


router.post('/login/google', authController.googleLogin);
router.get('/google/url', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.googleCallback);
router.get('/token/refresh', authController.refreshToken);
router.get('/token/verify', authController.verifyToken);
router.get('/logout', authController.logout);

module.exports = router;
