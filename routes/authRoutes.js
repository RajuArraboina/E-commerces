const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  resetPassword,
  testEmail,
  sendSignupOtp,
  verifySignupOtp,
  verifyLoginOtp,
  resendLoginOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-login-otp', resendLoginOtp);
router.post('/logout', logoutUser);
router.post('/forgot-password', resetPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendSignupOtp);
router.post('/verify-otp', verifySignupOtp);
router.post('/test-email', testEmail);
router.get('/me', protect, getMe);

module.exports = router;
