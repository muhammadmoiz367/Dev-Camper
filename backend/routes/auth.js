const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateUser,
  updatePassword,
  logoutUser,
} = require('../controllers/auth');
const { protectedRoute } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser)
router.post('/forgotPassword', forgotPassword);
router.put('/updateuser', protectedRoute, updateUser);
router.put('/updatepassword', protectedRoute, updatePassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/me', protectedRoute, getCurrentUser);

module.exports = router;
