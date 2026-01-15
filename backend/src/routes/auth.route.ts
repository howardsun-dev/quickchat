import express from 'express';
import {
  login,
  logout,
  signup,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.ts';
import { protectRoute } from '../middleware/auth.middleware.ts';
import { arcjetProtection } from '../middleware/arcjet.middleware.ts';

const router = express.Router();

router.use(arcjetProtection);

// router.get('/testlogin', arcjetProtection, (req, res) => {
//   res.json({ message: 'Arcjet Test Route' });
// });

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// TODO: Create Forget Password

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetPasswordToken', resetPassword);
router.post('/change-password', protectRoute, resetPassword);

router.put('/update-profile', protectRoute, updateProfile);

router.get('/check', protectRoute, (req, res) => {
  res.status(200).json(req.user);
});

export default router;
