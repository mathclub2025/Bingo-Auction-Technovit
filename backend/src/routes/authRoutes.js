import express from 'express';
import {
  signUp,
  signIn,
  getProfile,
  getTeams,
  updateTeamPoints
} from '../controllers/authController.js';

const router = express.Router();

// Authentication
router.post('/signup', signUp);
router.post('/login', signIn);
router.post('/admin/login', signIn);
router.post('/team/register', signUp);
router.post('/team/entry', signIn);
router.get('/me', getProfile);

// Public / Team view
router.get('/teams', getTeams);

// Admin Source Computer actions
router.post('/admin/update-team', updateTeamPoints);

export default router;
