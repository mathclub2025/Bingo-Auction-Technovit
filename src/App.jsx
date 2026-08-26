import React, { useMemo, useState, useEffect } from 'react';
import { initialTeamsData, mockAuctionRounds } from './data/mockAuctionState';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LandingPage from './pages/LandingPage';
import TeamLogin from './pages/TeamLogin';
import UserDashboard from './pages/UserDashboard';

const LOCAL_STORAGE_TEAM_ID_KEY = 'math_club_user_team_id';
const LOCAL_STORAGE_TEAMS_KEY = 'math_club_user_teams';

const getInitialPath = () => {
  const path = window.location.pathname;
  if (path === '/' || path === '') return '/LandingPage';
  if (['/LandingPage', '/TeamLogin', '/UserDashboard'].includes(path)) return path;
  return '/LandingPage';
};

export default function App() {
  // Current route pathname & search state
  const [currentPath, setCurrentPath] = useState(getInitialPath);
  const [currentSearch, setCurrentSearch] = useState(() => window.location.search);

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

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        window.history.replaceState(null, '', '/LandingPage');
        setCurrentPath('/LandingPage');
      } else if (['/LandingPage', '/TeamLogin', '/UserDashboard'].includes(path)) {
        setCurrentPath(path);
      } else {
        window.history.replaceState(null, '', '/LandingPage');
        setCurrentPath('/LandingPage');
      }
      setCurrentSearch(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirect root '/' -> '/LandingPage' on initial load
  useEffect(() => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState(null, '', '/LandingPage');
      setCurrentPath('/LandingPage');
    }
  }, []);

  // 1. Initialize Teams from localStorage or fallback to initialTeamsData
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

  // 2. Initialize Selected Team ID from localStorage
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

  // Collapsible Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Persist teams to localStorage whenever teams change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TEAMS_KEY, JSON.stringify(teams));
    } catch (err) {
      console.warn('Failed to save teams to localStorage:', err);
    }
  }, [teams]);

  // Computed active team object
  const activeTeam = useMemo(() => {
    if (!selectedTeamId) return teams[0];
    return teams.find((t) => t.id === selectedTeamId) || teams[0];
  }, [selectedTeamId, teams]);

  // Team login / submission handler
  const handleTeamSubmit = (submittedTeam) => {
    const teamExists = teams.some((t) => t.id === submittedTeam.id);
    if (!teamExists) {
      setTeams((prev) => [...prev, submittedTeam]);
    }

    setSelectedTeamId(submittedTeam.id);
    try {
      localStorage.setItem(LOCAL_STORAGE_TEAM_ID_KEY, submittedTeam.id);
    } catch (err) {
      console.warn('Failed to save selected team ID to localStorage:', err);
    }
    navigate('/UserDashboard');
    setSidebarOpen(false);
  };

  // Switch team / Logout handler
  const handleSwitchTeam = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_TEAM_ID_KEY);
    } catch (err) {
      console.warn('Failed to clear team ID from localStorage:', err);
    }
    setSelectedTeamId(null);
    navigate('/TeamLogin?tab=entry');
    setSidebarOpen(false);
  };

  // Add teammate handler
  const handleAddTeammate = (teamId, newTeammate) => {
    setTeams((currentTeams) =>
      currentTeams.map((t) => {
        if (t.id === teamId) {
          const currentMembers = t.members || [];
          // Avoid duplicate reg numbers
          if (currentMembers.some((m) => m.regNo.toUpperCase() === newTeammate.regNo.toUpperCase())) {
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

  // ROUTE 1: Landing Page (/LandingPage)
  if (currentPath === '/LandingPage') {
    return <LandingPage onEnterAuction={handleLandingEnter} />;
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

  // ROUTE 3: User Dashboard Page (/UserDashboard)
  if (currentPath === '/UserDashboard') {
    return (
      <div className={`figma-portal-shell ${sidebarOpen ? 'sidebar-is-open' : 'sidebar-is-closed'}`}>
        {/* Mobile/Tablet Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            title="Click to close sidebar"
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Collapsible Left Sidebar Navigation */}
        <Sidebar
          currentView="user-dashboard"
          onViewChange={(view) => {
            if (view === 'landing') navigate('/LandingPage');
            if (view === 'team-login') navigate('/TeamLogin');
          }}
          activeTeamName={activeTeam.name}
          activeRoundName={mockAuctionRounds.roundName}
          onSwitchTeam={handleSwitchTeam}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Area on the Right */}
        <div className="figma-main-area">
          {/* Top Navbar */}
          <Topbar
            currentView="user-dashboard"
            onViewChange={(view) => {
              if (view === 'landing') navigate('/LandingPage');
              if (view === 'team-login') navigate('/TeamLogin');
            }}
            activeTeamNumber={activeTeam.number}
            activeTeamName={activeTeam.name}
            activeTeamCoins={activeTeam.coins}
            onSwitchTeam={handleSwitchTeam}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />

          {/* Dynamic Route Content */}
          <main className="figma-content-viewport">
            <UserDashboard
              activeTeam={activeTeam}
              teams={teams}
              activeRoundName={mockAuctionRounds.roundName}
              onNavigate={(view) => {
                if (view === 'landing') navigate('/LandingPage');
                if (view === 'team-login') navigate('/TeamLogin');
              }}
              onAddTeammate={handleAddTeammate}
            />
          </main>
        </div>

        {/* Dev Team Quick Switcher */}
        <div className="floating-dev-switcher" title="Simulate different team viewpoints">
          <label htmlFor="dev-team-selector">Simulate Team: </label>
          <select
            id="dev-team-selector"
            value={selectedTeamId || ''}
            onChange={(e) => {
              const teamId = e.target.value;
              if (teamId) {
                setSelectedTeamId(teamId);
                localStorage.setItem(LOCAL_STORAGE_TEAM_ID_KEY, teamId);
              }
            }}
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Team #{t.number})
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // Fallback redirect for unknown routes
  return <LandingPage onEnterAuction={handleLandingEnter} />;
}

