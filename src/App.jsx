import React, { useMemo, useState, useEffect } from 'react';
import { initialTeamsData, mockAuctionRounds } from './data/mockAuctionState';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LandingPage from './pages/LandingPage';
import TeamLogin from './pages/TeamLogin';
import UserDashboard from './pages/UserDashboard';
import Auction from './pages/Auction';
import TeamProgress from './pages/TeamProgress';

const LOCAL_STORAGE_TEAM_ID_KEY = 'math_club_user_team_id';
const LOCAL_STORAGE_TEAMS_KEY = 'math_club_user_teams';

export default function App() {
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

  // 3. Initialize currentView based on whether a team is already logged in
  const [currentView, setCurrentView] = useState(() => {
    const savedTeamId = localStorage.getItem(LOCAL_STORAGE_TEAM_ID_KEY);
    return savedTeamId ? 'user-dashboard' : 'landing';
  });

  // 4. Collapsible Sidebar state - CLOSED BY DEFAULT
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeAuctionState, setActiveAuctionState] = useState('active');

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

  // Update coins handler
  const handleUpdateTeamCoins = (teamId, newCoins) => {
    setTeams((currentTeams) =>
      currentTeams.map((t) => (t.id === teamId ? { ...t, coins: newCoins } : t))
    );
  };

  // Add acquired number handler
  const handleAddTeamNumber = (teamId, number) => {
    setTeams((currentTeams) =>
      currentTeams.map((t) => {
        if (t.id === teamId) {
          if (t.numbers.includes(number)) return t;
          return { ...t, numbers: [...t.numbers, number] };
        }
        return t;
      })
    );
  };

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
    setCurrentView('user-dashboard');
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
    setCurrentView('team-login');
    setSidebarOpen(false);
  };

  const handlePlaceBidShortcut = () => {
    setCurrentView('user-auction');
    setActiveAuctionState('active');
    setSidebarOpen(false);
  };

  // Render Full-page views (Landing Page / Team Entry Login)
  if (currentView === 'landing') {
    return <LandingPage onEnterAuction={() => setCurrentView('team-login')} />;
  }

  if (currentView === 'team-login') {
    return (
      <TeamLogin
        teams={teams}
        onTeamSubmit={handleTeamSubmit}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  // Render Authenticated / Team Portal View with Topbar & Sidebar
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
        currentView={currentView}
        onViewChange={setCurrentView}
        activeTeamName={activeTeam.name}
        activeRoundName={mockAuctionRounds.roundName}
        onPlaceBidClick={handlePlaceBidShortcut}
        onSwitchTeam={handleSwitchTeam}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area on the Right */}
      <div className="figma-main-area">
        {/* Top Navbar */}
        <Topbar
          currentView={currentView}
          onViewChange={setCurrentView}
          activeTeamNumber={activeTeam.number}
          activeTeamName={activeTeam.name}
          activeTeamCoins={activeTeam.coins}
          onSwitchTeam={handleSwitchTeam}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Route Content */}
        <main className="figma-content-viewport">
          {currentView === 'user-dashboard' && (
            <UserDashboard
              activeTeam={activeTeam}
              teams={teams}
              activeRoundName={mockAuctionRounds.roundName}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'user-auction' && (
            <Auction
              activeTeam={activeTeam}
              onUpdateTeamCoins={handleUpdateTeamCoins}
              onAddTeamNumber={handleAddTeamNumber}
              activeAuctionState={activeAuctionState}
              setActiveAuctionState={setActiveAuctionState}
            />
          )}

          {currentView === 'user-progress' && (
            <TeamProgress
              activeTeam={activeTeam}
            />
          )}
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
