const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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
// TEAM AUTHENTICATION (Backend Connected)
// ============================================================================

/**
 * Register a new team with captain details (Passwordless)
 * Inputs: { teamName, captainName, captainRegNo }
 */
export async function registerTeam({ teamName, captainName, captainRegNo }) {
  const res = await request('/api/auth/team/register', {
    method: 'POST',
    body: JSON.stringify({ teamName, captainName, captainRegNo }),
  });
  if (res.token) {
    setToken(res.token);
  }
  return res;
}

/**
 * Team Entry / Login using registered Team Name (Passwordless)
 * Inputs: { teamName }
 */
export async function loginTeam({ teamName }) {
  const res = await request('/api/auth/team/entry', {
    method: 'POST',
    body: JSON.stringify({ teamName }),
  });
  if (res.token) {
    setToken(res.token);
  }
  return res;
}

// ============================================================================
// ADMIN AUTHENTICATION (Backend Connected)
// ============================================================================

/**
 * Admin Login with Username + Password
 * Inputs: { username, password }
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
 * Add a new teammate directly into Supabase database (team_members table)
 */
export async function addTeammateToDatabase(teamId, { name, regNo, role = 'Teammate' }) {
  const res = await request(`/api/teams/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify({ name, regNo, role }),
  });
  return res;
}
