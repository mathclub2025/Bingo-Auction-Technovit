import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findTeamByName, findTeamById, createTeam, getAllTeamsList } from '../services/teamStore.js';
import { broadcastAllTeams } from '../services/socketService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'math_club_auction_secret_key_2026';

/**
 * POST /api/auth/signup (or /register)
 * Team or Admin Registration
 * Sets initial coins = 50,000 | numbers_collected = []
 */
export async function signUp(req, res) {
  try {
    const { teamName, password = 'TeamPassword123!', role = 'team' } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ error: 'teamName is required.' });
    }

    const trimmed = teamName.trim();

    // Check if team name already exists
    const existing = await findTeamByName(trimmed);
    if (existing) {
      return res.status(400).json({ error: `Team "${trimmed}" is already registered. Please sign in.` });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create team with 50,000 initial coins
    const newTeam = await createTeam({
      teamName: trimmed,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'team'
    });

    // Generate JWT token with Role
    const token = jwt.sign(
      { id: newTeam.id, teamName: newTeam.team_name, role: newTeam.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeTeamData } = newTeam;

    // Realtime broadcast of updated team standings
    const allTeams = await getAllTeamsList();
    broadcastAllTeams(allTeams.filter(t => t.role === 'team'));

    return res.status(201).json({
      message: 'Registration successful',
      token,
      team: safeTeamData
    });
  } catch (err) {
    console.error('Sign up error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

/**
 * POST /api/auth/signin (or /login)
 * Team or Admin Login with bcrypt verification
 */
export async function signIn(req, res) {
  try {
    const { teamName, password } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ error: 'teamName is required.' });
    }

    const trimmed = teamName.trim();
    const team = await findTeamByName(trimmed);

    if (!team) {
      return res.status(404).json({ error: `Team "${trimmed}" not found. Please register first.` });
    }

    // Validate password if provided
    if (password && team.password_hash) {
      const isValid = await bcrypt.compare(password, team.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: team.id, teamName: team.team_name, role: team.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeTeamData } = team;

    return res.json({
      message: 'Sign in successful',
      token,
      team: safeTeamData
    });
  } catch (err) {
    console.error('Sign in error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

/**
 * GET /api/auth/profile
 * Get authenticated user profile via JWT
 */
export async function getProfile(req, res) {
  try {
    const team = await findTeamById(req.user.id);
    if (!team) {
      return res.json({ team: req.user });
    }
    const { password_hash, ...safeData } = team;
    return res.json({ team: safeData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
