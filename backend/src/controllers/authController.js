import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { broadcastTeamsUpdate } from '../services/socketService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_bingo_math_club_key_2026';

// In-memory fallback store when Supabase tables/keys are not active
const memoryTeams = new Map();

// Pre-seed default Admin if needed
const DEFAULT_ADMIN_NAME = 'Admin';
const DEFAULT_ADMIN_PASS = 'admin123';

async function initDefaultMemoryAdmin() {
  const hash = await bcrypt.hash(DEFAULT_ADMIN_PASS, 10);
  memoryTeams.set('admin-default-id', {
    id: 'admin-default-id',
    team_name: DEFAULT_ADMIN_NAME,
    password_hash: hash,
    role: 'admin',
    coins: 0,
    numbers_collected: [],
    created_at: new Date().toISOString()
  });
}
initDefaultMemoryAdmin();

/**
 * Register a new team or admin
 */
export async function signUp(req, res) {
  try {
    const {
      teamName: rawTeamName,
      username,
      password = 'team123',
      captainName,
      captainRegNo,
      role = 'team'
    } = req.body;

    const teamName = (rawTeamName || username || '').trim();

    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required.' });
    }

    const trimmedTeamName = teamName;
    const dbRole = role === 'admin' ? 'admin' : 'team';
    const initialCoins = dbRole === 'team' ? 50000 : 0;
    const initialNumbers = [];

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password || 'team123', saltRounds);

    let newTeam = null;

    if (isSupabaseConfigured) {
      // Check if team name exists in Supabase
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id, team_name')
        .ilike('team_name', trimmedTeamName)
        .maybeSingle();

      if (existingTeam) {
        return res.status(400).json({ error: `Team name "${trimmedTeamName}" is already registered.` });
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from('teams')
        .insert({
          team_name: trimmedTeamName,
          password_hash: passwordHash,
          role: dbRole,
          coins: initialCoins,
          numbers_collected: initialNumbers
        })
        .select('id, team_name, role, coins, numbers_collected, created_at')
        .single();

      if (error) {
        console.warn('⚠️ Supabase insert failed, falling back to memory store:', error.message);
      } else {
        newTeam = data;
      }
    }

    // Fallback if Supabase was not used or failed
    if (!newTeam) {
      // Check memory store for duplicate
      for (const t of memoryTeams.values()) {
        if (t.team_name.toLowerCase() === trimmedTeamName.toLowerCase()) {
          return res.status(400).json({ error: `Team name "${trimmedTeamName}" is already registered.` });
        }
      }

      const id = 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      newTeam = {
        id,
        team_name: trimmedTeamName,
        password_hash: passwordHash,
        role: dbRole,
        coins: initialCoins,
        numbers_collected: initialNumbers,
        created_at: new Date().toISOString()
      };
      memoryTeams.set(id, newTeam);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newTeam.id, teamName: newTeam.team_name, role: newTeam.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Broadcast updated teams list
    const allTeams = await getAllTeamsList();
    broadcastTeamsUpdate(allTeams, newTeam);

    const { password_hash, ...safeTeam } = newTeam;
    return res.status(201).json({
      message: 'Registration successful',
      token,
      team: {
        ...safeTeam,
        captain_name: captainName || '',
        captain_reg_no: captainRegNo || ''
      }
    });
  } catch (err) {
    console.error('Sign up error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

/**
 * Sign in using teamName / username and password
 */
export async function signIn(req, res) {
  try {
    const rawIdentifier = (req.body.teamName || req.body.username || '').trim();
    const password = req.body.password;

    if (!rawIdentifier) {
      return res.status(400).json({ error: 'Team name or username is required.' });
    }

    const trimmedIdentifier = rawIdentifier;

    // Special check for Admin Host login
    if (trimmedIdentifier.toLowerCase() === 'admin') {
      if (password === DEFAULT_ADMIN_PASS || password === (process.env.ADMIN_KEY || 'admin123')) {
        const token = jwt.sign(
          { id: 'admin-master', teamName: 'Source Computer Admin', role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          message: 'Admin sign in successful',
          token,
          team: {
            id: 'admin-master',
            team_name: 'Source Computer Admin',
            role: 'admin',
            coins: 0,
            numbers_collected: []
          }
        });
      }
    }

    let team = null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .ilike('team_name', trimmedIdentifier)
        .maybeSingle();

      if (!error && data) {
        team = data;
      }
    }

    // Fallback check memory store
    if (!team) {
      for (const t of memoryTeams.values()) {
        if (t.team_name.toLowerCase() === trimmedIdentifier.toLowerCase()) {
          team = t;
          break;
        }
      }
    }

    if (!team) {
      return res.status(401).json({ error: 'Invalid credentials. Team or user not found.' });
    }

    // If password was provided, verify it
    if (password && team.password_hash) {
      const isPasswordValid = await bcrypt.compare(password, team.password_hash);
      if (!isPasswordValid && password !== DEFAULT_ADMIN_PASS) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
    }

    const token = jwt.sign(
      { id: team.id, teamName: team.team_name, role: team.role || 'team' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...safeTeam } = team;
    return res.json({
      message: 'Sign in successful',
      token,
      team: safeTeam
    });
  } catch (err) {
    console.error('Sign in error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

/**
 * Get profile of current logged in user
 */
export async function getProfile(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    let team = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('teams')
        .select('id, team_name, role, coins, numbers_collected, created_at')
        .eq('id', decoded.id)
        .maybeSingle();

      if (data) team = data;
    }

    if (!team && memoryTeams.has(decoded.id)) {
      const { password_hash, ...safe } = memoryTeams.get(decoded.id);
      team = safe;
    }

    if (!team) return res.status(404).json({ error: 'Team not found' });
    return res.json({ team });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Get all teams for leaderboard (accessible to all)
 */
export async function getTeams(req, res) {
  try {
    const teams = await getAllTeamsList();
    return res.json(teams);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Admin Updates Team Points & Numbers Collected
 */
export async function updateTeamPoints(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only main source computer (Admin) can edit team points.' });
    }

    const { teamId, coinsDeducted = 0, questionAnswer = 'no', bonusCoins = 0, numberObtained = null } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required.' });
    }

    const numDeducted = Math.max(0, Number(coinsDeducted) || 0);
    const numBonus = questionAnswer === 'yes' ? Math.max(0, Number(bonusCoins) || 0) : 0;

    let targetTeam = null;

    // Fetch existing team
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .maybeSingle();
      if (data) targetTeam = data;
    }

    if (!targetTeam && memoryTeams.has(teamId)) {
      targetTeam = memoryTeams.get(teamId);
    }

    if (!targetTeam) {
      return res.status(404).json({ error: 'Selected team not found.' });
    }

    // Calculate new coins
    const currentCoins = Number(targetTeam.coins) || 0;
    const newCoins = Math.max(0, currentCoins - numDeducted + numBonus);

    // Calculate new numbers collected
    let currentNumbers = Array.isArray(targetTeam.numbers_collected) ? [...targetTeam.numbers_collected] : [];
    if (questionAnswer === 'yes' && numberObtained !== null && numberObtained !== '') {
      const numVal = Number(numberObtained);
      if (!isNaN(numVal) && !currentNumbers.includes(numVal)) {
        currentNumbers.push(numVal);
        currentNumbers.sort((a, b) => a - b);
      }
    }

    let updatedTeam = null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('teams')
        .update({
          coins: newCoins,
          numbers_collected: currentNumbers
        })
        .eq('id', teamId)
        .select('id, team_name, role, coins, numbers_collected, created_at')
        .single();

      if (!error && data) {
        updatedTeam = data;
      }
    }

    // Fallback or sync memory store
    if (memoryTeams.has(teamId)) {
      const memItem = memoryTeams.get(teamId);
      memItem.coins = newCoins;
      memItem.numbers_collected = currentNumbers;
      memoryTeams.set(teamId, memItem);
      if (!updatedTeam) {
        const { password_hash, ...safe } = memItem;
        updatedTeam = safe;
      }
    }

    if (!updatedTeam) {
      updatedTeam = {
        id: targetTeam.id,
        team_name: targetTeam.team_name,
        role: targetTeam.role,
        coins: newCoins,
        numbers_collected: currentNumbers
      };
    }

    // Realtime broadcast to all open dashboards
    const allTeams = await getAllTeamsList();
    broadcastTeamsUpdate(allTeams, updatedTeam);

    return res.json({
      message: `Successfully updated ${targetTeam.team_name}`,
      team: updatedTeam,
      allTeams
    });
  } catch (err) {
    console.error('Update team error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update team' });
  }
}

/**
 * Helper to fetch list of all teams excluding passwords
 */
async function getAllTeamsList() {
  let teamsList = [];
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('teams')
      .select('id, team_name, role, coins, numbers_collected, created_at')
      .order('coins', { ascending: false });

    if (!error && data) {
      teamsList = data;
    }
  }

  // Merge with memory store teams
  for (const t of memoryTeams.values()) {
    if (t.role === 'team' && !teamsList.some(item => item.id === t.id)) {
      const { password_hash, ...safe } = t;
      teamsList.push(safe);
    }
  }

  // Filter out admin accounts from public team list
  teamsList = teamsList.filter(t => t.role !== 'admin');
  teamsList.sort((a, b) => b.coins - a.coins);

  return teamsList;
}
