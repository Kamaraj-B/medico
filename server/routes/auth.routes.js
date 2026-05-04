const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require("../middlewares/auth.middleware");


router.post('/login/google', authController.googleLogin);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/doctor-request', authController.doctorRequest);
router.post('/change-password', protect, authController.changePassword);
router.post('/set-password-with-token', authController.setPasswordWithToken);
router.get('/doctor-requests/pending', protect, authController.getPendingDoctorRequests);
router.post('/doctor-requests/:id/approve', protect, authController.approveDoctorRequest);
router.post('/doctor-requests/:id/reject', protect, authController.rejectDoctorRequest);
router.get('/google/url', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.googleCallback);
router.get('/token/refresh', authController.refreshToken);
router.get('/token/verify', authController.verifyToken);
router.get('/logout', authController.logout);

module.exports = router;
