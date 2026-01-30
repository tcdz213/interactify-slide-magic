
import React, { useState, useEffect } from 'react';
import { GameState, Planet } from './types';
import { PLANETS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import GameEngine from './components/GameEngine';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pang_high_score_v3');
    return saved ? parseInt(saved, 10) : 0;
  });

  const currentPlanet = PLANETS[currentPlanetIndex];

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('pang_high_score_v3', score.toString());
    }
  }, [score, highScore]);

  const startGame = () => {
    setScore(0);
    setLives(5);
    setCurrentPlanetIndex(0);
    setGameState(GameState.PLANET_INTRO);
  };

  const handleNextPlanet = () => {
    if (currentPlanetIndex < PLANETS.length - 1) {
      setCurrentPlanetIndex(prev => prev + 1);
      setGameState(GameState.PLANET_INTRO);
    } else {
      setGameState(GameState.VICTORY);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#020205] flex items-center justify-center overflow-hidden font-sans">
      <div 
        className="relative shadow-[0_0_80px_rgba(0,0,0,1)] border-8 border-[#101015] rounded-xl overflow-hidden bg-black"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        <GameEngine 
          gameState={gameState}
          planet={currentPlanet}
          lives={lives}
          setLives={setLives}
          score={score}
          setScore={setScore}
          onLevelComplete={() => setGameState(GameState.LEVEL_COMPLETE)}
          onGameOver={() => setGameState(GameState.GAME_OVER)}
        />

        {/* HUD - Glassmorphism style */}
        {gameState !== GameState.START_SCREEN && (
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10 text-white">
            <div className="bg-black/40 backdrop-blur-lg p-3 border border-white/10 rounded-xl shadow-2xl">
              <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-1 opacity-70">Simulation Score</div>
              <div className="text-2xl font-bold font-mono text-white tracking-tighter glow-text">{score.toString().padStart(6, '0')}</div>
            </div>
            <div className="text-center px-6 py-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/5">
              <div className="text-lg font-black text-white tracking-[0.2em] uppercase italic">{currentPlanet.name}</div>
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">Sector {currentPlanetIndex + 1}</div>
            </div>
            <div className="bg-black/40 backdrop-blur-lg p-3 border border-white/10 rounded-xl flex flex-col items-end shadow-2xl">
              <div className="text-[10px] uppercase tracking-widest text-rose-500 font-bold mb-1 opacity-70">Unit Vitals</div>
              <div className="flex gap-1.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm rotate-45 border border-white/10 ${i < lives ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-transparent border-dashed'}`}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Screens */}
        {gameState === GameState.START_SCREEN && (
          <div className="absolute inset-0 bg-[#020205] flex flex-col items-center justify-center text-center p-12 z-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]"></div>
            <div className="mb-4 text-cyan-500/50 tracking-[1em] text-[10px] font-bold uppercase animate-pulse">Advanced Combat Interface</div>
            <h1 className="text-8xl font-black text-white mb-2 tracking-tighter glow-text-lg italic">
              PANG <span className="text-cyan-500">2140</span>
            </h1>
            <h2 className="text-xs text-gray-500 mb-12 tracking-[0.4em] font-bold uppercase border-t border-white/10 pt-4">Zero Point Gravity Protocol</h2>
            
            <button 
              onClick={startGame}
              className="group relative px-20 py-5 bg-transparent border-2 border-cyan-500 text-cyan-500 overflow-hidden transition-all duration-300 font-black tracking-widest uppercase text-xl hover:text-white hover:scale-105"
            >
              <div className="absolute inset-0 bg-cyan-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <span className="relative z-10">Initiate Protocol</span>
            </button>
            
            <div className="mt-16 flex gap-12 text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">
              <div className="hover:text-cyan-400 transition-colors cursor-help">L/R: Thrusters</div>
              <div className="hover:text-cyan-400 transition-colors cursor-help">Space: Discharge</div>
            </div>
          </div>
        )}

        {gameState === GameState.PLANET_INTRO && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center z-30">
            <div className="w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin mb-8"></div>
            <div className="text-cyan-500 text-xs tracking-[1em] mb-4 uppercase font-bold">Vectoring...</div>
            <h2 className="text-6xl font-black text-white mb-6 uppercase tracking-widest italic">{currentPlanet.name}</h2>
            <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-6"></div>
            <p className="text-gray-500 text-lg font-light italic max-w-md px-4">{currentPlanet.description}</p>
            <AutoStart onStart={() => setGameState(GameState.PLAYING)} />
          </div>
        )}

        {gameState === GameState.LEVEL_COMPLETE && (
          <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-2xl flex flex-col items-center justify-center text-center z-20">
            <h2 className="text-7xl font-black text-white mb-4 uppercase italic tracking-tighter">Sector Secured</h2>
            <div className="h-1 w-64 bg-gradient-to-r from-cyan-500 to-white mb-12"></div>
            <button 
              onClick={handleNextPlanet}
              className="group px-14 py-5 bg-white text-black hover:bg-cyan-500 hover:text-white transition-all text-xl font-black uppercase tracking-widest"
            >
              Next Objective <span className="inline-block group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-3xl flex flex-col items-center justify-center text-center z-20">
            <div className="text-rose-500 text-6xl mb-6">⚠</div>
            <h2 className="text-8xl font-black text-white mb-4 italic uppercase tracking-tighter">System Critical</h2>
            <p className="text-rose-400 text-xl font-bold tracking-[0.4em] mb-12 uppercase opacity-80">Simulation Terminated</p>
            <button 
              onClick={startGame}
              className="px-12 py-5 border-2 border-white text-white hover:bg-white hover:text-black transition-all text-xl font-black uppercase tracking-widest"
            >
              Re-Initialize System
            </button>
          </div>
        )}

        {gameState === GameState.VICTORY && (
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-black to-cyan-950 flex flex-col items-center justify-center text-center z-20">
            <div className="mb-8 p-6 bg-cyan-500/20 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.5)]">
               <svg className="w-20 h-20 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h2 className="text-8xl font-black text-white mb-2 italic tracking-tighter uppercase">Simulation Success</h2>
            <p className="text-cyan-400 text-xl mb-12 tracking-[0.5em] font-bold">Galactic Order Restored</p>
            <button 
              onClick={startGame}
              className="px-16 py-6 bg-cyan-500 text-black font-black uppercase tracking-[0.2em] hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              Return to Base
            </button>
          </div>
        )}
      </div>
      <style>{`
        .glow-text { text-shadow: 0 0 8px rgba(255,255,255,0.4); }
        .glow-text-lg { text-shadow: 0 0 25px rgba(6,182,212,0.7); }
        @keyframes scanline { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
        .scanlines::after {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: rgba(255,255,255,0.05); animation: scanline 4s linear infinite; pointer-events: none;
        }
      `}</style>
    </div>
  );
};

const AutoStart: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  useEffect(() => {
    const timer = setTimeout(onStart, 3000);
    return () => clearTimeout(timer);
  }, [onStart]);
  return null;
};

export default App;
