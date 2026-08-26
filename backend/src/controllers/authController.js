import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { broadcastTeamsUpdate } from '../services/socketService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_bingo_math_club_key_2026';

// In-memory fallback store when Supabase tables/keys are not active
const memoryTeams = new Map();

/**
 * Register a new team (No seed data, uses live participant details)
 * Inputs: { teamName, captainName, captainRegNo }
 */
export async function signUp(req, res) {
  try {
    const {
      teamName: rawTeamName,
      username,
      captainName,
      captainRegNo
    } = req.body;

    const cleanTeamName = (rawTeamName || username || '').trim().replace(/\s+/g, ' ');

    if (!cleanTeamName) {
      return res.status(400).json({ error: 'Team name is required.' });
    }

    const trimmedTeamName = cleanTeamName;
    const initialCoins = 50000;
    const initialNumbers = [];

    let newTeam = null;

    if (isSupabaseConfigured) {
      // 1. Strict Team Name Uniqueness Check (Case & Whitespace Insensitive)
      const { data: allExistingTeams } = await supabase
        .from('teams')
        .select('id, team_name');

      if (allExistingTeams) {
        const normalizedTarget = trimmedTeamName.replace(/\s+/g, '').toLowerCase();
        const duplicate = allExistingTeams.find(
          (t) => (t.team_name || '').replace(/\s+/g, '').toLowerCase() === normalizedTarget
        );
        if (duplicate) {
          return res.status(400).json({
            error: `Team name "${trimmedTeamName}" is already registered (as "${duplicate.team_name}"). Please choose a unique team name.`
          });
        }
      }

      // 2. Strict Captain Reg No Uniqueness Check across the entire system
      const cleanCaptainReg = (captainRegNo || '').replace(/\s+/g, '').toUpperCase();
      if (cleanCaptainReg) {
        // Check if reg_no exists in teams table as captain
        const { data: existingCaptain } = await supabase
          .from('teams')
          .select('id, team_name, captain_name, captain_reg_no')
          .ilike('captain_reg_no', cleanCaptainReg)
          .maybeSingle();

        if (existingCaptain) {
          return res.status(400).json({
            error: `Registration number "${cleanCaptainReg}" is already registered as Captain of team "${existingCaptain.team_name}". Each participant can belong to only one team.`
          });
        }

        // Check if reg_no exists in team_members table
        const { data: existingMember } = await supabase
          .from('team_members')
          .select('id, reg_no, name, role, teams(team_name)')
          .ilike('reg_no', cleanCaptainReg)
          .maybeSingle();

        if (existingMember) {
          const registeredTeam = existingMember.teams?.team_name || 'another team';
          return res.status(400).json({
            error: `Registration number "${cleanCaptainReg}" is already registered under "${existingMember.name}" (${existingMember.role || 'Member'}) in team "${registeredTeam}". Each participant can belong to only one team.`
          });
        }
      }

      // Insert team into Supabase teams table
      const { data, error } = await supabase
        .from('teams')
        .insert({
          team_name: trimmedTeamName,
          captain_name: (captainName || '').trim() || (trimmedTeamName + ' Captain'),
          captain_reg_no: (captainRegNo || '').trim() || 'REG_N/A',
          coins: initialCoins,
          numbers_collected: initialNumbers
        })
        .select()
        .single();

      if (error) {
        console.error('⚠️ Supabase team insert failed:', error.message);
        return res.status(500).json({ error: 'Failed to create team in database: ' + error.message });
      } else {
        newTeam = data;
        // Insert captain into team_members table
        if (captainName && captainRegNo) {
          try {
            await supabase.from('team_members').insert({
              team_id: data.id,
              name: captainName.trim(),
              reg_no: captainRegNo.trim(),
              role: 'Captain'
            });
          } catch (e) {
            console.warn('Could not insert captain into team_members:', e.message);
          }
        }
      }
    } else {
      // Memory fallback if DB is completely unconfigured
      for (const t of memoryTeams.values()) {
        if (t.team_name.toLowerCase() === trimmedTeamName.toLowerCase()) {
          return res.status(400).json({ error: `Team name "${trimmedTeamName}" is already registered.` });
        }
      }

      const id = 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      newTeam = {
        id,
        team_name: trimmedTeamName,
        captain_name: captainName || '',
        captain_reg_no: captainRegNo || '',
        coins: initialCoins,
        numbers_collected: initialNumbers,
        created_at: new Date().toISOString()
      };
      memoryTeams.set(id, newTeam);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newTeam.id, teamName: newTeam.team_name, role: 'team' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Broadcast updated teams list
    const allTeams = await getAllTeamsList();
    broadcastTeamsUpdate(allTeams, newTeam);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      team: newTeam
    });
  } catch (err) {
    console.error('Sign up error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

/**
 * Sign in using teamName / username (Passwordless for Teams, Password-checked for Admin in DB)
 */
export async function signIn(req, res) {
  try {
    const rawIdentifier = (req.body.teamName || req.body.username || '').trim();
    const password = req.body.password;

    if (!rawIdentifier) {
      return res.status(400).json({ error: 'Team name or username is required.' });
    }

    const trimmedIdentifier = rawIdentifier;

    if (isSupabaseConfigured) {
      // 1. Check admin_users table in Supabase (Strictly authenticated via SQL-created admin records)
      const { data: adminUser, error: adminErr } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('username', trimmedIdentifier)
        .maybeSingle();

      if (!adminErr && adminUser) {
        if (!password) {
          return res.status(400).json({ error: 'Admin password is required.' });
        }

        let isPassValid = false;
        try {
          isPassValid = await bcrypt.compare(password, adminUser.password_hash);
        } catch (e) {}
        // Also allow plain text match if inserted directly via SQL
        if (!isPassValid && password === adminUser.password_hash) {
          isPassValid = true;
        }

        if (isPassValid) {
          const token = jwt.sign(
            { id: adminUser.id, username: adminUser.username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          return res.json({
            message: 'Admin sign in successful',
            token,
            team: {
              id: adminUser.id,
              username: adminUser.username,
              team_name: adminUser.username,
              display_name: adminUser.username,
              role: 'admin',
              coins: 0,
              numbers_collected: []
            }
          });
        } else {
          return res.status(401).json({ error: 'Invalid admin password.' });
        }
      }
    }

    // 2. Check teams table (Passwordless team entry for live registered teams)
    let team = null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .ilike('team_name', trimmedIdentifier)
        .maybeSingle();

      if (!error && data) {
        team = data;
      } else {
        // Fallback: match by normalized stripped whitespace & lowercase
        const { data: allTeams } = await supabase.from('teams').select('*');
        if (allTeams) {
          const target = trimmedIdentifier.replace(/\s+/g, '').toLowerCase();
          team = allTeams.find((t) => (t.team_name || '').replace(/\s+/g, '').toLowerCase() === target) || null;
        }
      }
    } else {
      for (const t of memoryTeams.values()) {
        if (t.team_name.toLowerCase() === trimmedIdentifier.toLowerCase()) {
          team = t;
          break;
        }
      }
    }

    if (!team) {
      return res.status(401).json({ error: `Team "${trimmedIdentifier}" not found. Please register first.` });
    }

    const token = jwt.sign(
      { id: team.id, teamName: team.team_name, role: 'team' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Sign in successful',
      token,
      team: {
        id: team.id,
        team_name: team.team_name,
        coins: team.coins ?? 50000,
        numbers_collected: team.numbers_collected || [],
        captain_name: team.captain_name || '',
        captain_reg_no: team.captain_reg_no || ''
      }
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
      if (decoded.role === 'admin') {
        const { data } = await supabase
          .from('admin_users')
          .select('id, username, display_name, created_at')
          .eq('id', decoded.id)
          .maybeSingle();
        if (data) {
          team = {
            id: data.id,
            team_name: data.display_name || data.username,
            role: 'admin',
            coins: 0,
            numbers_collected: []
          };
        }
      } else {
        const { data } = await supabase
          .from('teams')
          .select('id, team_name, captain_name, captain_reg_no, coins, numbers_collected, created_at')
          .eq('id', decoded.id)
          .maybeSingle();
        if (data) team = data;
      }
    }

    if (!team && memoryTeams.has(decoded.id)) {
      const { password_hash, ...safe } = memoryTeams.get(decoded.id);
      team = safe;
    }

    if (!team) return res.status(404).json({ error: 'Account not found' });
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
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role && decoded.role !== 'admin') {
          return res.status(403).json({ error: 'Access denied. Only Admin can edit team points.' });
        }
      } catch (e) {
        // Token invalid, allow admin control desk
      }
    }

    const { teamId, teamName, coinsDeducted = 0, questionAnswer = 'no', bonusCoins = 0, numberObtained = null } = req.body;

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
          numbers_collected: currentNumbers,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select('id, team_name, captain_name, captain_reg_no, coins, numbers_collected, created_at, updated_at')
        .single();

      if (!error && data) {
        updatedTeam = data;
      }

      // Record score audit log
      try {
        await supabase.from('score_audit_logs').insert({
          team_id: teamId,
          coins_deducted: numDeducted,
          bonus_added: numBonus,
          number_won: questionAnswer === 'yes' && numberObtained !== null ? Number(numberObtained) : null,
          answer_status: questionAnswer === 'yes' ? 'Correct' : 'Incorrect',
          previous_coins: currentCoins,
          new_coins: newCoins
        });
      } catch (auditErr) {
        console.warn('Audit log notice:', auditErr.message);
      }
    }

    if (!updatedTeam) {
      updatedTeam = {
        id: targetTeam.id,
        team_name: targetTeam.team_name,
        captain_name: targetTeam.captain_name || '',
        captain_reg_no: targetTeam.captain_reg_no || '',
        coins: newCoins,
        numbers_collected: currentNumbers
      };
    }

    // Realtime broadcast to all open dashboards and participants
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
 * Helper to fetch list of all teams from Supabase
 */
async function getAllTeamsList() {
  let teamsList = [];
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('teams')
      .select('id, team_name, captain_name, captain_reg_no, coins, numbers_collected, created_at')
      .order('coins', { ascending: false });

    if (!error && data) {
      teamsList = data;
    }
  }

  teamsList.sort((a, b) => (b.coins || 0) - (a.coins || 0));
  return teamsList;
}