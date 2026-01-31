
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Planet } from './types';
import { PLANETS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import GameEngine from './components/GameEngine';
import MobileGameLayout from './components/MobileGameLayout';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pang_high_score_v3');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Virtual control states - shared with GameEngine
  const virtualControlsRef = useRef<{
    moveDirection: { x: number; y: number };
    blasterPressed: boolean;
    dodgePressed: boolean;
  }>({
    moveDirection: { x: 0, y: 0 },
    blasterPressed: false,
    dodgePressed: false,
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

  const handleMoveChange = useCallback((direction: { x: number; y: number }) => {
    virtualControlsRef.current.moveDirection = direction;
  }, []);

  const handleBlaster = useCallback(() => {
    virtualControlsRef.current.blasterPressed = true;
    // Reset after a short delay
    setTimeout(() => {
      virtualControlsRef.current.blasterPressed = false;
    }, 50);
  }, []);

  const handleDodge = useCallback(() => {
    virtualControlsRef.current.dodgePressed = true;
    setTimeout(() => {
      virtualControlsRef.current.dodgePressed = false;
    }, 50);
  }, []);

  // Only enable touch controls during actual gameplay
  const controlsDisabled = gameState !== GameState.PLAYING;

  return (
    <MobileGameLayout
      onMoveChange={handleMoveChange}
      onFire={handleBlaster}
      controlsDisabled={controlsDisabled}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ background: '#050505' }}
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
          virtualControlsRef={virtualControlsRef}
        />

        {/* HUD - Glassmorphism style - adjusted for mobile */}
        {gameState !== GameState.START_SCREEN && (
          <div className="absolute top-0 left-0 w-full p-2 sm:p-4 flex justify-between items-start pointer-events-none z-10 text-white">
            <div className="bg-black/50 backdrop-blur-lg p-2 border border-white/10 rounded-lg shadow-2xl">
              <div className="text-[8px] uppercase tracking-widest text-cyan-400 font-bold mb-0.5 opacity-70">Score</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tighter glow-text">{score.toString().padStart(6, '0')}</div>
            </div>
            <div className="text-center px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/5">
              <div className="text-xs sm:text-sm font-black text-white tracking-wider uppercase italic">{currentPlanet.name}</div>
              <div className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Sector {currentPlanetIndex + 1}</div>
            </div>
            <div className="bg-black/50 backdrop-blur-lg p-2 border border-white/10 rounded-lg flex flex-col items-end shadow-2xl">
              <div className="text-[8px] uppercase tracking-widest text-rose-500 font-bold mb-0.5 opacity-70">Vitals</div>
              <div className="flex gap-1 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-sm rotate-45 border border-white/10 ${i < lives ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-transparent border-dashed'}`}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Screens */}
        {gameState === GameState.START_SCREEN && (
          <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center text-center p-6 z-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]"></div>
            <div className="mb-2 text-cyan-500/50 tracking-[0.5em] text-[8px] font-bold uppercase animate-pulse">Combat Interface</div>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-1 tracking-tighter glow-text-lg italic">
              PANG <span className="text-cyan-500">2140</span>
            </h1>
            <h2 className="text-[8px] text-gray-500 mb-8 tracking-[0.3em] font-bold uppercase border-t border-white/10 pt-2">Zero Point Gravity</h2>
            
            <button 
              onClick={startGame}
              className="group relative px-10 py-3 bg-transparent border-2 border-cyan-500 text-cyan-500 overflow-hidden transition-all duration-300 font-black tracking-widest uppercase text-sm hover:text-white hover:scale-105"
            >
              <div className="absolute inset-0 bg-cyan-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <span className="relative z-10">Start</span>
            </button>
            
            <div className="mt-8 flex flex-col gap-2 text-[8px] text-gray-600 uppercase tracking-wider font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-cyan-500/50"></div>
                <span>Left Side: Move</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-fuchsia-500/50"></div>
                <span>Right Side: Fire</span>
              </div>
            </div>
          </div>
        )}

        {gameState === GameState.PLANET_INTRO && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center z-30">
            <div className="w-10 h-10 border-t-2 border-cyan-500 rounded-full animate-spin mb-4"></div>
            <div className="text-cyan-500 text-[10px] tracking-[0.8em] mb-2 uppercase font-bold">Vectoring...</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 uppercase tracking-widest italic">{currentPlanet.name}</h2>
            <div className="h-0.5 w-40 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-4"></div>
            <p className="text-gray-500 text-sm font-light italic max-w-xs px-4">{currentPlanet.description}</p>
            <AutoStart onStart={() => setGameState(GameState.PLAYING)} />
          </div>
        )}

        {gameState === GameState.LEVEL_COMPLETE && (
          <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-xl flex flex-col items-center justify-center text-center z-20">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3 uppercase italic tracking-tighter">Sector Secured</h2>
            <div className="h-1 w-40 bg-gradient-to-r from-cyan-500 to-white mb-8"></div>
            <button 
              onClick={handleNextPlanet}
              className="group px-8 py-3 bg-white text-black hover:bg-cyan-500 hover:text-white transition-all text-lg font-black uppercase tracking-widest"
            >
              Next <span className="inline-block group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center z-20">
            <div className="text-rose-500 text-4xl mb-4">⚠</div>
            <h2 className="text-5xl font-black text-white mb-3 italic uppercase tracking-tighter">System Critical</h2>
            <p className="text-rose-400 text-sm font-bold tracking-[0.3em] mb-8 uppercase opacity-80">Terminated</p>
            <button 
              onClick={startGame}
              className="px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-black transition-all text-lg font-black uppercase tracking-widest"
            >
              Retry
            </button>
          </div>
        )}

        {gameState === GameState.VICTORY && (
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-black to-cyan-950 flex flex-col items-center justify-center text-center z-20">
            <div className="mb-4 p-4 bg-cyan-500/20 rounded-full shadow-[0_0_40px_rgba(6,182,212,0.5)]">
               <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h2 className="text-5xl font-black text-white mb-2 italic tracking-tighter uppercase">Success</h2>
            <p className="text-cyan-400 text-sm mb-8 tracking-[0.4em] font-bold">Order Restored</p>
            <button 
              onClick={startGame}
              className="px-10 py-4 bg-cyan-500 text-black font-black uppercase tracking-widest hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <style>{`
        .glow-text { text-shadow: 0 0 8px rgba(255,255,255,0.4); }
        .glow-text-lg { text-shadow: 0 0 25px rgba(6,182,212,0.7); }
      `}</style>
    </MobileGameLayout>
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