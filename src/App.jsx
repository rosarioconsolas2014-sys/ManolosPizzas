import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Game from './pages/Game.jsx';
import Results from './pages/Results.jsx';
import Ranking from './pages/Ranking.jsx';
import Admin from './pages/Admin.jsx';
import { getGameConfig } from './services/configService.js';
import { getMonthlyChampion, getMonthlyRanking } from './services/scoreService.js';
import { DEFAULT_CONFIG } from './utils/gameConfig.js';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'register' | 'game' | 'results' | 'ranking' | 'admin' | 'howToPlay'
  const [player, setPlayer] = useState(null);
  const [gameSummary, setGameSummary] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [champion, setChampion] = useState(null);
  const [topScore, setTopScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    loadGlobalData();
  }, []);

  const loadGlobalData = async () => {
    try {
      const cfg = await getGameConfig();
      setConfig(cfg);

      const champ = await getMonthlyChampion(cfg.currentMonth);
      setChampion(champ);

      const ranking = await getMonthlyRanking(cfg.currentMonth);
      if (ranking && ranking.length > 0) {
        setTopScore(ranking[0].totalScore || 0);
      }
    } catch (e) {
      console.warn('Initial global data load notice:', e);
    }
  };

  const handleStartGame = () => {
    if (player) {
      setCurrentView('game');
    } else {
      setCurrentView('register');
    }
  };

  const handleParticipantReady = (newPlayer) => {
    setPlayer(newPlayer);
    setCurrentView('game');
  };

  const handleCompleteGame = (summary) => {
    setGameSummary(summary);
    setCurrentView('results');
    loadGlobalData();
  };

  const handlePlayAgain = () => {
    setGameSummary(null);
    setCurrentView('game');
  };

  const handleResetToHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#383028] font-sans flex flex-col selection:bg-[#27864B] selection:text-white">
      {/* Italian Flag Strip Ribbon at Top */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)] z-50 shadow-xs" />

      {/* Subtle Pizzeria Warm Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#27864b_0.6px,transparent_0.6px),_radial-gradient(#d93636_0.6px,transparent_0.6px)] [background-size:32px_32px] [background-position:0_0,16px_16px] opacity-15 z-0" />

      {/* Header Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        player={player}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onResetGame={handleResetToHome}
      />

      {/* Main Content Router */}
      <main className="relative z-10 flex-1 flex flex-col">
        {currentView === 'home' && (
          <Home
            onStartGame={handleStartGame}
            onViewRanking={() => setCurrentView('ranking')}
            champion={champion}
            config={config}
            topScore={topScore}
          />
        )}

        {currentView === 'howToPlay' && (
          <Home
            onStartGame={handleStartGame}
            onViewRanking={() => setCurrentView('ranking')}
            champion={champion}
            config={config}
            topScore={topScore}
          />
        )}

        {currentView === 'register' && (
          <Register
            onParticipantReady={handleParticipantReady}
            onBackToHome={() => setCurrentView('home')}
            maxAttempts={Number(config?.maxAttempts ?? config?.maxAttemptsPerPlayer) || 3}
            unlimitedAttempts={Boolean(config?.unlimitedAttempts)}
            competitionEnabled={config?.competitionEnabled !== false && config?.status !== 'pausado'}
            startDate={config?.startDate}
            endDate={config?.endDate}
            gameActive={config?.competitionEnabled !== false && config?.status !== 'pausado'}
          />
        )}

        {currentView === 'game' && (
          <Game
            player={player}
            onCompleteGame={handleCompleteGame}
            onAbortGame={() => setCurrentView('home')}
          />
        )}

        {currentView === 'results' && (
          <Results
            player={player}
            gameSummary={gameSummary}
            onPlayAgain={handlePlayAgain}
            onViewRanking={() => setCurrentView('ranking')}
          />
        )}

        {currentView === 'ranking' && (
          <Ranking
            onBackToHome={() => setCurrentView('home')}
            onStartGame={handleStartGame}
            config={config}
            currentDni={player?.dni}
          />
        )}

        {currentView === 'admin' && (
          <Admin
            onBackToHome={() => setCurrentView('home')}
            onConfigUpdated={(newCfg) => setConfig(newCfg)}
          />
        )}
      </main>

      {/* Website Footer with Development Signature */}
      <Footer />
    </div>
  );
}
