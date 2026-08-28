export function getApiBaseUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('api') || params.get('backend') || params.get('server');
    if (fromQuery) {
      const clean = fromQuery.trim().replace(/\/+$/, '');
      localStorage.setItem('math_club_api_base_url', clean);
      return clean;
    }
    const saved = localStorage.getItem('math_club_api_base_url');
    if (saved) return saved;
  } catch (e) {}

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/+$/, '');
  }

  // Active Cloudflare Tunnel Fallback
  return 'https://strictly-jim-montgomery-dis.trycloudflare.com';
}

export const API_BASE_URL = getApiBaseUrl();
const TOKEN_STORAGE_KEY = 'math_club_auth_token';
const ADMIN_TOKEN_KEY = 'math_club_admin_token';

// ============================================================================
// JWT TOKEN HELPERS
// ============================================================================
export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

export function removeAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

// Universal Request Helper
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = options.isAdmin ? getAdminToken() : getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
    throw err;
  }
}

// ============================================================================
// TEAM AUTHENTICATION
// ============================================================================

/**
 * Register a new team with captain details and Bingo Card Set (1 to 4)
 */
export async function registerTeam({ teamName, captainName, captainRegNo, bingoCardSet = 1 }) {
  const res = await request('/api/auth/team/register', {
    method: 'POST',
    body: JSON.stringify({
      teamName,
      captainName,
      captainRegNo,
      bingoCardSet: Number(bingoCardSet) || 1
    }),
  });
  if (res.token) {
    setToken(res.token);
  }
  return res;
}

/**
 * Team Entry / Login using registered Team Name & Captain Registration Number
 */
export async function loginTeam({ teamName, captainRegNo }) {
  const res = await request('/api/auth/team/entry', {
    method: 'POST',
    body: JSON.stringify({ teamName, captainRegNo }),
  });
  if (res.token) {
    setToken(res.token);
  }
  return res;
}

// ============================================================================
// ADMIN AUTHENTICATION & CONTROLS
// ============================================================================

/**
 * Admin Login with Username + Password
 */
export async function loginAdmin({ username, password }) {
  const res = await request('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (res.token) {
    setAdminToken(res.token);
  }
  return res;
}

/**
 * Add a new teammate directly into database
 */
export async function addTeammateToDatabase(teamId, { name, regNo, role = 'Teammate' }) {
  const res = await request(`/api/teams/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify({ name, regNo, role }),
  });
  return res;
}

/**
 * Award round bonus (+250 coins) to all teams
 */
export async function awardRoundBonus(amount = 250) {
  const res = await request('/api/teams/admin/award-round-bonus', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  return res;
}

/**
 * Resolve Level 4 Offline PPT Dare/Puzzle
 */
export async function resolveLevel4({ teamId, amountBidded, isAnswerCorrect, numberBidded, bonusCoins = 5000 }) {
  const res = await request('/api/teams/admin/resolve-level-4', {
    method: 'POST',
    body: JSON.stringify({
      teamId,
      amountBidded,
      isAnswerCorrect,
      numberBidded,
      bonusCoins
    }),
  });
  return res;
}

export const resolveLevel5 = resolveLevel4;

/**
 * Remove a specific team from the tournament
 */
export async function deleteTeamFromDatabase(teamId) {
  const res = await request(`/api/teams/${teamId}`, {
    method: 'DELETE',
    isAdmin: true,
  });
  return res;
}

/**
 * Clear the entire tournament database (teams, members, score logs)
 */
export async function clearDatabaseFromAdmin() {
  const res = await request('/api/teams/admin/clear-database', {
    method: 'POST',
    isAdmin: true,
  });
  return res;
}
