import express from 'express';
import { signUp, signIn, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/signup', signUp);
router.post('/register', signUp);
router.post('/signin', signIn);
router.post('/login', signIn);

// Protected Authentication Profile
router.get('/profile', authenticateToken, getProfile);

export default router;
