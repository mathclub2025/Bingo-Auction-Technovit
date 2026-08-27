import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { evaluateBingoCard } from '../data/bingoGrids.js';

// In-memory fallback stores if Supabase credentials are not connected
const fallbackTeams = new Map();
const fallbackAuditLogs = [];

/**
 * Helper to enrich team object with Bingo status (required numbers and win state)
 */
export function enrichTeamWithBingo(team) {
  if (!team) return null;
  const setNumber = team.bingo_card_set || team.bingoCardSet || 1;
  const numbers = Array.isArray(team.numbers_collected) ? team.numbers_collected : (Array.isArray(team.numbers) ? team.numbers : []);
  const evaluation = evaluateBingoCard(setNumber, numbers);

  return {
    ...team,
    bingo_card_set: Number(setNumber),
    isWinner: evaluation.isWinner,
    completedLinesCount: evaluation.completedLinesCount,
    requiredNumbers: evaluation.requiredNumbers
  };
}

/**
 * Find team by name (case-insensitive)
 */
export async function findTeamByName(teamName) {
  const trimmed = teamName.trim();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .ilike('team_name', trimmed)
        .maybeSingle();
      if (!error && data) return enrichTeamWithBingo(data);
    } catch (e) {
      console.warn('[Store] Supabase query failed:', e.message);
    }
  }

  for (const team of fallbackTeams.values()) {
    if (team.team_name.toLowerCase() === trimmed.toLowerCase()) {
      return enrichTeamWithBingo(team);
    }
  }
  return null;
}

/**
 * Find team by ID
 */
export async function findTeamById(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return enrichTeamWithBingo(data);
    } catch (e) {
      console.warn('[Store] Supabase query failed:', e.message);
    }
  }
  const fallback = fallbackTeams.get(id);
  return fallback ? enrichTeamWithBingo(fallback) : null;
}

/**
 * Create a new team with initial 50,000 coins and selected bingo card set (1-4)
 */
export async function createTeam({ teamName, passwordHash, role = 'team', bingoCardSet, captainName = '', captainRegNo = '' }) {
  const trimmed = teamName.trim();
  const initialCoins = role === 'admin' ? 0 : 50000;
  const initialNumbers = [];
  const cardSet = bingoCardSet ? Math.min(4, Math.max(1, Number(bingoCardSet))) : (Math.floor(Math.random() * 4) + 1);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          team_name: trimmed,
          password_hash: passwordHash,
          role,
          bingo_card_set: cardSet,
          captain_name: captainName || (trimmed + ' Captain'),
          captain_reg_no: captainRegNo || 'REG_N/A',
          coins: initialCoins,
          numbers_collected: initialNumbers
        })
        .select()
        .single();
      if (!error && data) {
        fallbackTeams.set(data.id, data);
        return enrichTeamWithBingo(data);
      }
      if (error) {
        console.warn('[Store] Supabase insert failed:', error.message);
      }
    } catch (e) {
      console.warn('[Store] Supabase insert exception:', e.message);
    }
  }

  const id = `00000000-0000-4000-8000-${Date.now().toString().padStart(12, '0').slice(-12)}`;
  const newTeam = {
    id,
    team_name: trimmed,
    password_hash: passwordHash,
    role,
    bingo_card_set: cardSet,
    captain_name: captainName,
    captain_reg_no: captainRegNo,
    coins: initialCoins,
    numbers_collected: initialNumbers,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  fallbackTeams.set(id, newTeam);
  return enrichTeamWithBingo(newTeam);
}

/**
 * Get all teams ordered by coins descending with their team members and Bingo evaluation
 */
export async function getAllTeamsList() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          team_name,
          captain_name,
          captain_reg_no,
          bingo_card_set,
          coins,
          numbers_collected,
          created_at,
          updated_at,
          team_members (
            id,
            name,
            reg_no,
            role,
            added_at
          )
        `)
        .order('coins', { ascending: false });

      if (!error && data) {
        return data.map(t => {
          let members = Array.isArray(t.team_members) ? t.team_members : [];
          if (members.length === 0 && t.captain_name) {
            members = [
              {
                id: 'capt-' + t.id,
                name: t.captain_name,
                reg_no: t.captain_reg_no || 'N/A',
                role: 'Captain',
                added_at: t.created_at
              }
            ];
          }
          return enrichTeamWithBingo({
            ...t,
            members
          });
        });
      }
      if (error) {
        console.warn('[Store] Supabase fetch error:', error.message);
      }
    } catch (e) {
      console.warn('[Store] Supabase fetch all teams failed:', e.message);
    }
  }

  const list = Array.from(fallbackTeams.values()).map(t => enrichTeamWithBingo({
    id: t.id,
    team_name: t.team_name,
    role: t.role,
    bingo_card_set: t.bingo_card_set || 1,
    coins: t.coins,
    numbers_collected: t.numbers_collected || [],
    created_at: t.created_at,
    updated_at: t.updated_at,
    members: t.members || []
  }));

  return list.sort((a, b) => (b.coins || 0) - (a.coins || 0));
}

/**
 * Add a teammate into team_members table in Supabase
 */
export async function addMemberToTeam({ teamId, name, regNo, role = 'Teammate' }) {
  const trimmedName = (name || '').trim();
  const trimmedReg = (regNo || '').replace(/\s+/g, '').toUpperCase();

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Check if reg_no is already registered as Captain
      const { data: existingCaptain } = await supabase
        .from('teams')
        .select('id, team_name, captain_name, captain_reg_no')
        .ilike('captain_reg_no', trimmedReg)
        .maybeSingle();

      if (existingCaptain) {
        if (existingCaptain.id === teamId) {
          return {
            success: false,
            error: `Registration number "${trimmedReg}" is already registered as the Captain of this team (${existingCaptain.team_name}).`
          };
        } else {
          return {
            success: false,
            error: `Registration number "${trimmedReg}" is already registered as the Captain of team "${existingCaptain.team_name}". Each participant can belong to only one team.`
          };
        }
      }

      // 2. Check if reg_no is already registered in team_members table
      const { data: existingReg } = await supabase
        .from('team_members')
        .select('id, name, reg_no, role, team_id, teams(team_name)')
        .ilike('reg_no', trimmedReg)
        .maybeSingle();

      if (existingReg) {
        const teamName = existingReg.teams?.team_name || 'another team';
        if (existingReg.team_id === teamId) {
          return {
            success: false,
            error: `Student with Registration Number "${trimmedReg}" (${existingReg.name}) is already added to your team roster.`
          };
        } else {
          return {
            success: false,
            error: `Registration number "${trimmedReg}" is already registered in team "${teamName}" under member "${existingReg.name}" (${existingReg.role || 'Teammate'}). Each participant can belong to only one team.`
          };
        }
      }

      // 3. Insert into Supabase team_members table
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          name: trimmedName,
          reg_no: trimmedReg,
          role: role
        })
        .select()
        .single();

      if (!error && data) {
        return { success: true, member: data };
      }
      if (error) {
        console.error('⚠️ Supabase insert member error:', error.message);
        return { success: false, error: error.message };
      }
    } catch (e) {
      console.error('⚠️ Supabase insert member exception:', e.message);
      return { success: false, error: e.message };
    }
  }

  // Fallback in-memory validation
  for (const t of fallbackTeams.values()) {
    if (t.members && t.members.some(m => (m.reg_no || m.regNo || '').toUpperCase() === trimmedReg)) {
      return {
        success: false,
        error: `Registration number "${trimmedReg}" is already registered under team "${t.team_name}". Each participant can belong to only one team.`
      };
    }
  }

  const mem = {
    id: 'mem-' + Date.now(),
    team_id: teamId,
    name: trimmedName,
    reg_no: trimmedReg,
    role,
    added_at: new Date().toISOString()
  };

  const target = fallbackTeams.get(teamId);
  if (target) {
    if (!target.members) target.members = [];
    target.members.push(mem);
  }

  return { success: true, member: mem };
}

/**
 * Update team data in DB
 */
export async function updateTeamData(id, updatePayload) {
  updatePayload.updated_at = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        fallbackTeams.set(id, { ...fallbackTeams.get(id), ...data });
        return enrichTeamWithBingo(data);
      }
    } catch (e) {
      console.warn('[Store] Supabase update failed:', e.message);
    }
  }

  const existing = fallbackTeams.get(id);
  if (!existing) return null;

  const updated = { ...existing, ...updatePayload };
  fallbackTeams.set(id, updated);
  return enrichTeamWithBingo(updated);
}

/**
 * Add bonus coins to ALL registered teams (e.g. +250 after every 5 rounds)
 */
export async function addCoinsToAllTeams(amount = 250) {
  const teams = await getAllTeamsList();
  const updatedTeams = [];

  for (const team of teams) {
    if (team.role === 'admin') continue;
    const newCoins = (Number(team.coins) || 0) + Number(amount);
    const updated = await updateTeamData(team.id, { coins: newCoins });
    if (updated) updatedTeams.push(updated);
  }

  return updatedTeams;
}

/**
 * Insert into score_audit_logs
 */
export async function insertScoreAuditLog({ teamId, coinsDeducted, bonusAdded, numberWon, answerStatus, previousCoins, newCoins }) {
  const auditItem = {
    team_id: teamId,
    coins_deducted: coinsDeducted,
    bonus_added: bonusAdded || 0,
    number_won: numberWon || null,
    answer_status: answerStatus, // 'yes' | 'no'
    previous_coins: previousCoins,
    new_coins: newCoins,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('score_audit_logs')
        .insert(auditItem)
        .select()
        .single();
      if (!error && data) {
        fallbackAuditLogs.unshift(data);
        return data;
      }
    } catch (e) {
      console.warn('[Store] Supabase audit log insert failed:', e.message);
    }
  }

  const logEntry = {
    id: `audit-${Date.now()}`,
    ...auditItem
  };
  fallbackAuditLogs.unshift(logEntry);
  if (fallbackAuditLogs.length > 200) fallbackAuditLogs.pop();
  return logEntry;
}

/**
 * Get recent score audit logs
 */
export async function getScoreAuditLogs() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('score_audit_logs')
        .select('*, teams(team_name)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) return data;
    } catch (e) {
      console.warn('[Store] Supabase audit log fetch failed:', e.message);
    }
  }
  return fallbackAuditLogs;
}

/**
 * Reset all teams to initial 50,000 coins and empty numbers
 */
export async function resetAllTeamsToInitial() {
  const teams = await getAllTeamsList();
  const resetResults = [];
  for (const team of teams) {
    if (team.role === 'team' || !team.role) {
      const updated = await updateTeamData(team.id, {
        coins: 50000,
        numbers_collected: []
      });
      resetResults.push(updated);
    }
  }
  return resetResults;
}

/**
 * Delete a single team by ID and cascade clean related records
 */
export async function deleteTeamById(teamId) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('score_audit_logs').delete().eq('team_id', teamId);
      await supabase.from('team_members').delete().eq('team_id', teamId);
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) throw error;
    } catch (e) {
      console.warn('[Store] Supabase deleteTeamById error:', e.message);
    }
  }

  fallbackTeams.delete(teamId);
  return { success: true, teamId };
}

/**
 * Clear the entire tournament database (teams, team_members, score_audit_logs)
 * Preserves admin accounts in admin_users
 */
export async function clearEntireDatabaseFromStore() {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('score_audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {
      console.warn('[Store] Supabase clearEntireDatabaseFromStore error:', e.message);
    }
  }

  fallbackTeams.clear();
  fallbackAuditLogs.length = 0;
  return { success: true };
}