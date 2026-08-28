import React, { useMemo, useState, useEffect } from 'react';
import { initialTeamsData, mockAuctionRounds } from './data/mockAuctionState';
import Topbar from './components/Topbar';
import LandingPage from './pages/LandingPage';
import TeamLogin from './pages/TeamLogin';
import UserDashboard from './pages/UserDashboard';
import Auction from './pages/Auction';
import TeamProgress from './pages/TeamProgress';
import AdminDashboard from './pages/AdminDashboard';
import AdminModal from './components/AdminModal';
import BingoWarningModal from './components/BingoWarningModal';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from './services/api';

const LOCAL_STORAGE_TEAM_ID_KEY = 'math_club_user_team_id';
const LOCAL_STORAGE_TEAMS_KEY = 'math_club_user_teams';
const API_BASE_URL = getApiBaseUrl();

const VALID_ROUTES = ['/LandingPage', '/TeamLogin', '/UserDashboard', '/Auction', '/TeamProgress', '/AdminDashboard'];

const normalizePath = (raw) => {
  if (!raw) return '/LandingPage';
  let clean = decodeURIComponent(raw).trim();
  if (clean.includes('?')) clean = clean.split('?')[0];
  if (clean.includes('#')) clean = clean.split('#')[0];
  if (clean.startsWith('#')) clean = clean.slice(1);
  if (!clean.startsWith('/')) clean = `/${clean}`;
  if (clean.endsWith('/') && clean.length > 1) clean = clean.slice(0, -1);

  // Case-insensitive match against valid routes
  const matched = VALID_ROUTES.find((r) => r.toLowerCase() === clean.toLowerCase());
  if (matched) return matched;
  return null;
};

const getInitialPath = () => {
  // 1. Check Query Params (e.g. ?page=AdminDashboard or ?route=/AdminDashboard or ?view=admin)
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page') || params.get('view') || params.get('route');
  if (pageParam) {
    const fromQuery = normalizePath(pageParam);
    if (fromQuery) return fromQuery;
    if (pageParam.toLowerCase() === 'admin' || pageParam.toLowerCase() === '/admin') return '/AdminDashboard';
  }

  // 2. Check Hash (e.g. #/AdminDashboard or #AdminDashboard)
  const hash = window.location.hash;
  if (hash) {
    const fromHash = normalizePath(hash);
    if (fromHash) return fromHash;
  }

  // 3. Check Pathname (e.g. /AdminDashboard)
  const path = window.location.pathname;
  if (path && path !== '/') {
    const fromPath = normalizePath(path);
    if (fromPath) return fromPath;
  }

  return '/LandingPage';
};

export default function App() {
  // Current route pathname & search state
  const [currentPath, setCurrentPath] = useState(getInitialPath);
  const [currentSearch, setCurrentSearch] = useState(() => window.location.search);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [activeAuctionState, setActiveAuctionState] = useState('active');
  const [bingoWarning, setBingoWarning] = useState(null);

  // Router navigation helper
  const navigate = (toPath, options = {}) => {
    const [pathPart, searchPart] = toPath.split('?');
    const fullSearch = searchPart ? `?${searchPart}` : '';

    if (options.replace) {
      window.history.replaceState(options.state || null, '', toPath);
    } else {
      window.history.pushState(options.state || null, '', toPath);
    }
    setCurrentPath(pathPart);
    setCurrentSearch(fullSearch);
    window.scrollTo(0, 0);
  };

  // Synchronize browser history (Back / Forward buttons & Hash Changes)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getInitialPath());
      setCurrentSearch(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // 1. Teams State
  const [teams, setTeams] = useState(() => {
    try {
      const savedTeams = localStorage.getItem(LOCAL_STORAGE_TEAMS_KEY);
      if (savedTeams) {
        return JSON.parse(savedTeams);
      }
    } catch (err) {
      console.warn('Could not parse teams from localStorage:', err);
    }
    return initialTeamsData;
  });

  // 2. Selected Team ID
  const [selectedTeamId, setSelectedTeamId] = useState(() => {
    try {
      const savedTeamId = localStorage.getItem(LOCAL_STORAGE_TEAM_ID_KEY);
      if (savedTeamId) {
        return savedTeamId;
      }
    } catch (err) {
      console.warn('Could not read team ID from localStorage:', err);
    }
    return null;
  });

  // Fetch real team records from backend API
  const fetchTeamsFromBackend = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams`);
      if (res.ok) {
        const data = await res.json();
        const rawTeams = Array.isArray(data) ? data : (data.teams || []);
        if (Array.isArray(rawTeams) && rawTeams.length > 0) {
          const formatted = rawTeams.map((t, idx) => ({
            id: t.id,
            number: idx + 1,
            name: t.team_name || t.name || 'Unnamed Team',
            bingo_card_set: t.bingo_card_set || t.bingoCardSet || 1,
            coins: Number(t.coins) || 0,
            numbers: Array.isArray(t.numbers_collected) ? t.numbers_collected : (Array.isArray(t.numbers) ? t.numbers : []),
            rank: idx + 1,
            members: t.members || [],
            captain: { name: t.captain_name || '', regNo: t.captain_reg_no || '' }
          }));
          setTeams(formatted);
        }
      }
    } catch (err) {
      console.warn('Backend server offline or unreachable, using local fallback:', err.message);
    }
  };

  useEffect(() => {
    fetchTeamsFromBackend();

    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to live Math Club auction socket server');
      socket.emit('join_dashboard', { role: 'participant' });
    });

    socket.on('teams:updated', (payload) => {
      console.log('📡 Live teams update received via WebSocket:', payload);
      if (payload && Array.isArray(payload.teams)) {
        const formatted = payload.teams.map((t, idx) => ({
          id: t.id,
          number: idx + 1,
          name: t.team_name || t.name,
          team_name: t.team_name || t.name,
          bingo_card_set: t.bingo_card_set || t.bingoCardSet || 1,
          coins: Number(t.coins) || 0,
          numbers: Array.isArray(t.numbers_collected) ? t.numbers_collected : (Array.isArray(t.numbers) ? t.numbers : []),
          rank: idx + 1,
          members: t.members || [],
          captain: { name: t.captain_name || '', regNo: t.captain_reg_no || '' }
        }));
        setTeams(formatted);
      }
    });

    socket.on('team:updated', () => {
      fetchTeamsFromBackend();
    });

    const seenWarningKeys = new Set();

    socket.on('bingo:required_number_warning', (data) => {
      if (!data || !data.teamId || !Array.isArray(data.requiredNumbers) || data.requiredNumbers.length === 0) return;

      // If triggered by organizer entering a target number, always show it!
      if (data.isTargetNumberAlert) {
        console.log('⚡ [Live Match Point Alert on Target Number]:', data);
        setBingoWarning(data);
        return;
      }

      const warningKey = `${data.teamId}_${data.requiredNumbers.slice().sort().join('-')}`;
      if (seenWarningKeys.has(warningKey)) {
        console.log(`⚠️ [Bingo Warning] Suppressed duplicate modal for ${data.teamName || data.teamId} (${warningKey})`);
        return;
      }

      seenWarningKeys.add(warningKey);
      console.log('⚠️ [Bingo Required Number Warning Displayed]:', data);
      setBingoWarning(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Persist teams to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TEAMS_KEY, JSON.stringify(teams));
    } catch (err) {
      console.warn('Failed to save teams to localStorage:', err);
    }
  }, [teams]);

  const emptyTeamFallback = {
    id: '',
    number: 1,
    name: 'No Team Selected',
    coins: 50000,
    numbers: [],
    rank: 1,
    captain: { name: '', regNo: '' },
    members: []
  };

  // Computed active team object
  const activeTeam = useMemo(() => {
    if (!selectedTeamId) return teams[0] || emptyTeamFallback;
    return teams.find((t) => String(t.id) === String(selectedTeamId)) || teams[0] || emptyTeamFallback;
  }, [selectedTeamId, teams]);

  // Team authentication submission handler
  const handleTeamSubmit = (submittedTeam) => {
    const formatted = {
      ...submittedTeam,
      id: submittedTeam.id,
      name: submittedTeam.team_name || submittedTeam.name,
      bingo_card_set: submittedTeam.bingo_card_set || submittedTeam.bingoCardSet || 1,
      coins: submittedTeam.coins ?? 50000,
      numbers: submittedTeam.numbers_collected || submittedTeam.numbers || [],
      captain: {
        name: submittedTeam.captain_name || submittedTeam.captain?.name || '',
        regNo: submittedTeam.captain_reg_no || submittedTeam.captain?.regNo || '',
      },
      members: submittedTeam.members || (submittedTeam.captain_name ? [
        {
          name: submittedTeam.captain_name,
          regNo: submittedTeam.captain_reg_no,
          role: 'Captain',
          addedAt: 'Initial Registration',
        }
      ] : []),
    };

    setTeams((prevTeams) => {
      const exists = prevTeams.some((t) => String(t.id) === String(formatted.id));
      if (exists) {
        return prevTeams.map((t) => (String(t.id) === String(formatted.id) ? { ...t, ...formatted } : t));
      }
      return [...prevTeams, formatted];
    });

    setSelectedTeamId(formatted.id);
    try {
      localStorage.setItem(LOCAL_STORAGE_TEAM_ID_KEY, String(formatted.id));
    } catch (err) {
      console.warn('Could not save team ID to localStorage:', err);
    }

    navigate('/UserDashboard');
  };

  // Teammate added handler
  const handleAddTeammate = (teamIdOrMember, maybeMember) => {
    const newTeammate = maybeMember || teamIdOrMember;
    const targetTeamId = maybeMember ? teamIdOrMember : activeTeam.id;

    setTeams((prevTeams) =>
      prevTeams.map((t) => {
        if (String(t.id) === String(targetTeamId)) {
          const currentMembers = Array.isArray(t.members) ? t.members : [];
          if (currentMembers.some(m => (m.reg_no || m.regNo) === (newTeammate.reg_no || newTeammate.regNo))) {
            return t;
          }
          return {
            ...t,
            members: [...currentMembers, newTeammate],
          };
        }
        return t;
      })
    );
    setTimeout(fetchTeamsFromBackend, 500);
  };

  // Team switch / logout handler
  const handleSwitchTeam = () => {
    setSelectedTeamId(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_TEAM_ID_KEY);
      removeToken();
    } catch (err) {
      console.warn('Error clearing team auth from storage:', err);
    }
    navigate('/LandingPage');
  };

  // Coin balance update handler
  const handleUpdateTeamCoins = (teamId, newCoins) => {
    setTeams((prev) =>
      prev.map((t) => (String(t.id) === String(teamId) ? { ...t, coins: newCoins } : t))
    );
  };

  // Add number handler
  const handleAddTeamNumber = (teamId, numberToAdd) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (String(t.id) === String(teamId)) {
          const numbers = t.numbers || [];
          if (!numbers.includes(numberToAdd)) {
            return { ...t, numbers: [...numbers, numberToAdd] };
          }
        }
        return t;
      })
    );
  };

  // Handler for Landing Page CTAs ('register' or 'entry')
  const handleLandingEnter = (tabMode) => {
    const tab = tabMode === 'entry' ? 'entry' : 'register';
    navigate(`/TeamLogin?tab=${tab}`);
  };

  // Determine initial tab for TeamLogin page from URL search params
  const getTeamLoginInitialTab = () => {
    const params = new URLSearchParams(currentSearch);
    const tabParam = params.get('tab');
    if (tabParam === 'entry') return 'entry';
    return 'register';
  };

  // Navigation mapper for Topbar
  const handleViewChange = (view) => {
    if (view === 'user-dashboard') navigate('/UserDashboard');
    else if (view === 'user-auction') navigate('/Auction');
    else if (view === 'user-progress') navigate('/TeamProgress');
    else if (view === 'admin') navigate('/AdminDashboard');
    else if (view === 'landing') navigate('/LandingPage');
    else if (view === 'team-login') navigate('/TeamLogin');
  };

  // Determine current active view string for tabs
  const activeViewName = useMemo(() => {
    if (currentPath === '/Auction') return 'user-auction';
    if (currentPath === '/TeamProgress') return 'user-progress';
    if (currentPath === '/AdminDashboard') return 'admin';
    return 'user-dashboard';
  }, [currentPath]);

  // Function to render active route page
  const renderActiveRoute = () => {
    // ROUTE 1: Landing Page (/LandingPage)
    if (currentPath === '/LandingPage') {
      return (
        <LandingPage
          onEnterAuction={handleLandingEnter}
          onOpenAdmin={() => navigate('/AdminDashboard')}
          teams={teams}
        />
      );
    }

    // ROUTE 2: Team Login Page (/TeamLogin)
    if (currentPath === '/TeamLogin') {
      return (
        <TeamLogin
          teams={teams}
          initialTab={getTeamLoginInitialTab()}
          onTeamSubmit={handleTeamSubmit}
          onBackToLanding={() => navigate('/LandingPage')}
        />
      );
    }

    // ROUTE 3: Admin Dashboard Desk (/AdminDashboard)
    if (currentPath === '/AdminDashboard') {
      return (
        <AdminDashboard
          onSwitchToUserView={() => navigate(selectedTeamId ? '/UserDashboard' : '/LandingPage')}
        />
      );
    }

    // ROUTE GUARD: If accessing UserDashboard without logging in, show Team Entry
    if (['/UserDashboard', '/Auction', '/TeamProgress'].includes(currentPath) && !selectedTeamId) {
      return (
        <TeamLogin
          teams={teams}
          initialTab="entry"
          onTeamSubmit={handleTeamSubmit}
          onBackToLanding={() => navigate('/LandingPage')}
        />
      );
    }

    // MAIN PORTAL (UserDashboard, Auction, TeamProgress) - Clean Full Width
    return (
      <div className="figma-portal-shell full-width">
        <div className="figma-main-area">
          {/* Top Navbar */}
          <Topbar
            currentView={activeViewName}
            onViewChange={handleViewChange}
            activeTeamNumber={activeTeam.number || 1}
            activeTeamName={activeTeam.name || activeTeam.team_name}
            activeTeamCoins={activeTeam.coins}
            onSwitchTeam={handleSwitchTeam}
            onOpenAdmin={() => handleViewChange('admin')}
          />

          {/* Dynamic Route Content */}
          <main className="figma-content-viewport">
            {currentPath === '/UserDashboard' && (
              <UserDashboard
                activeTeam={activeTeam}
                teams={teams}
                activeRoundName={mockAuctionRounds.roundName}
                onNavigate={handleViewChange}
                onAddTeammate={handleAddTeammate}
              />
            )}

            {currentPath === '/Auction' && (
              <Auction
                activeTeam={activeTeam}
                onUpdateTeamCoins={handleUpdateTeamCoins}
                onAddTeamNumber={handleAddTeamNumber}
                activeAuctionState={activeAuctionState}
                setActiveAuctionState={setActiveAuctionState}
              />
            )}

            {currentPath === '/TeamProgress' && (
              <TeamProgress activeTeam={activeTeam} />
            )}
          </main>
        </div>

        {/* Admin Modal */}
        <AdminModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          onOpenFullAdmin={() => navigate('/AdminDashboard')}
          teams={teams}
        />
      </div>
    );
  };

  return (
    <>
      {renderActiveRoute()}

      {/* Global Bingo Warning Modal for All Users */}
      <BingoWarningModal
        warning={bingoWarning}
        onClose={() => setBingoWarning(null)}
      />
    </>
  );
}
