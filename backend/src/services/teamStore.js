import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

// In-memory fallback stores if Supabase credentials are not connected
const fallbackTeams = new Map();
const fallbackAuditLogs = [];

// Seed default admin in fallback store
(async () => {
  const adminHash = await bcrypt.hash('admin123', 10);
  fallbackTeams.set('00000000-0000-0000-0000-000000000001', {
    id: '00000000-0000-0000-0000-000000000001',
    team_name: 'Admin Host',
    password_hash: adminHash,
    role: 'admin',
    coins: 0,
    numbers_collected: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
})();

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
      if (!error && data) return data;
    } catch (e) {
      console.warn('[Store] Supabase query failed:', e.message);
    }
  }

  for (const team of fallbackTeams.values()) {
    if (team.team_name.toLowerCase() === trimmed.toLowerCase()) {
      return team;
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
      if (!error && data) return data;
    } catch (e) {
      console.warn('[Store] Supabase query failed:', e.message);
    }
  }
  return fallbackTeams.get(id) || null;
}

/**
 * Create a new team with initial 50,000 coins and empty numbers
 */
export async function createTeam({ teamName, passwordHash, role = 'team' }) {
  const trimmed = teamName.trim();
  const initialCoins = role === 'admin' ? 0 : 50000;
  const initialNumbers = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          team_name: trimmed,
          password_hash: passwordHash,
          role,
          coins: initialCoins,
          numbers_collected: initialNumbers
        })
        .select()
        .single();
      if (!error && data) {
        fallbackTeams.set(data.id, data);
        return data;
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
    coins: initialCoins,
    numbers_collected: initialNumbers,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  fallbackTeams.set(id, newTeam);
  return newTeam;
}

/**
 * Get all teams ordered by coins descending
 */
export async function getAllTeamsList() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, team_name, captain_name, captain_reg_no, coins, numbers_collected, created_at, updated_at')
        .order('coins', { ascending: false });
      if (!error && data) {
        return data;
      }
      if (error) {
        console.warn('[Store] Supabase fetch error:', error.message);
      }
    } catch (e) {
      console.warn('[Store] Supabase fetch all teams failed:', e.message);
    }
  }

  const list = Array.from(fallbackTeams.values()).map(t => ({
    id: t.id,
    team_name: t.team_name,
    role: t.role,
    coins: t.coins,
    numbers_collected: t.numbers_collected || [],
    created_at: t.created_at,
    updated_at: t.updated_at
  }));

  return list.sort((a, b) => (b.coins || 0) - (a.coins || 0));
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
        return data;
      }
    } catch (e) {
      console.warn('[Store] Supabase update failed:', e.message);
    }
  }

  const existing = fallbackTeams.get(id);
  if (!existing) return null;

  const updated = { ...existing, ...updatePayload };
  fallbackTeams.set(id, updated);
  return updated;
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
    if (team.role === 'team') {
      const updated = await updateTeamData(team.id, {
        coins: 50000,
        numbers_collected: []
      });
      resetResults.push(updated);
    }
  }
  return resetResults;
}
