
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Planet } from './types';
import { PLANETS } from './constants';
import GameEngine, { GameEngineRef } from './components/GameEngine';
import TouchControls from './components/TouchControls';
import { useGameDimensions } from './hooks/useGameDimensions';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pang_high_score_v3');
    return saved ? parseInt(saved, 10) : 0;
  });

  const gameEngineRef = useRef<GameEngineRef>(null);
  const { width: canvasWidth, height: canvasHeight } = useGameDimensions();
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window);

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

  // Touch control handlers
  const handleLeftStart = () => gameEngineRef.current?.moveLeft(true);
  const handleLeftEnd = () => gameEngineRef.current?.moveLeft(false);
  const handleRightStart = () => gameEngineRef.current?.moveRight(true);
  const handleRightEnd = () => gameEngineRef.current?.moveRight(false);
  const handleFire = () => gameEngineRef.current?.fire();

  return (
    <div className="fixed inset-0 bg-[#020205] flex items-center justify-center overflow-hidden font-sans touch-none select-none">
      {/* Safe area padding for mobile */}
      <div 
        className={`relative overflow-hidden bg-black ${isMobile ? 'w-full h-full' : 'shadow-[0_0_80px_rgba(0,0,0,1)] border-8 border-[#101015] rounded-xl'}`}
        style={isMobile ? { 
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        } : { width: canvasWidth, height: canvasHeight }}
      >
        <GameEngine 
          ref={gameEngineRef}
          gameState={gameState}
          planet={currentPlanet}
          lives={lives}
          setLives={setLives}
          score={score}
          setScore={setScore}
          onLevelComplete={() => setGameState(GameState.LEVEL_COMPLETE)}
          onGameOver={() => setGameState(GameState.GAME_OVER)}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />

        {/* HUD - Responsive for mobile */}
        {gameState !== GameState.START_SCREEN && (
          <div className="absolute top-0 left-0 w-full p-3 md:p-6 flex justify-between items-start pointer-events-none z-10 text-white" style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}>
            <div className="bg-black/40 backdrop-blur-lg p-2 md:p-3 border border-white/10 rounded-lg md:rounded-xl shadow-2xl">
              <div className="text-[8px] md:text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-0.5 md:mb-1 opacity-70">Score</div>
              <div className="text-lg md:text-2xl font-bold font-mono text-white tracking-tighter glow-text">{score.toString().padStart(6, '0')}</div>
            </div>
            <div className="text-center px-3 md:px-6 py-1.5 md:py-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/5">
              <div className="text-sm md:text-lg font-black text-white tracking-[0.1em] md:tracking-[0.2em] uppercase italic">{currentPlanet.name}</div>
              <div className="text-[7px] md:text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">Sector {currentPlanetIndex + 1}</div>
            </div>
            <div className="bg-black/40 backdrop-blur-lg p-2 md:p-3 border border-white/10 rounded-lg md:rounded-xl flex flex-col items-end shadow-2xl">
              <div className="text-[8px] md:text-[10px] uppercase tracking-widest text-rose-500 font-bold mb-0.5 md:mb-1 opacity-70">Lives</div>
              <div className="flex gap-1 md:gap-1.5 mt-0.5 md:mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 md:w-3 md:h-3 rounded-sm rotate-45 border border-white/10 ${i < lives ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-transparent border-dashed'}`}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Touch Controls */}
        {isMobile && (
          <TouchControls
            onLeftStart={handleLeftStart}
            onLeftEnd={handleLeftEnd}
            onRightStart={handleRightStart}
            onRightEnd={handleRightEnd}
            onFire={handleFire}
            isPlaying={gameState === GameState.PLAYING}
          />
        )}

        {/* Screens - Responsive */}
        {gameState === GameState.START_SCREEN && (
          <div className="absolute inset-0 bg-[#020205] flex flex-col items-center justify-center text-center p-6 md:p-12 z-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]"></div>
            <div className="mb-2 md:mb-4 text-cyan-500/50 tracking-[0.5em] md:tracking-[1em] text-[8px] md:text-[10px] font-bold uppercase animate-pulse">Advanced Combat Interface</div>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-2 tracking-tighter glow-text-lg italic">
              PANG <span className="text-cyan-500">2140</span>
            </h1>
            <h2 className="text-[10px] md:text-xs text-gray-500 mb-8 md:mb-12 tracking-[0.2em] md:tracking-[0.4em] font-bold uppercase border-t border-white/10 pt-2 md:pt-4">Zero Point Gravity Protocol</h2>
            
            <button 
              onClick={startGame}
              className="group relative px-10 md:px-20 py-4 md:py-5 bg-transparent border-2 border-cyan-500 text-cyan-500 overflow-hidden transition-all duration-300 font-black tracking-widest uppercase text-base md:text-xl hover:text-white hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-cyan-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <span className="relative z-10">{isMobile ? 'Start' : 'Initiate Protocol'}</span>
            </button>
            
            {!isMobile && (
              <div className="mt-16 flex gap-12 text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">
                <div className="hover:text-cyan-400 transition-colors cursor-help">L/R: Thrusters</div>
                <div className="hover:text-cyan-400 transition-colors cursor-help">Space: Discharge</div>
              </div>
            )}
            
            {isMobile && (
              <div className="mt-8 text-[10px] text-gray-500 uppercase tracking-widest">
                Use on-screen controls to play
              </div>
            )}
          </div>
        )}

        {gameState === GameState.PLANET_INTRO && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center z-30 px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 border-t-2 border-cyan-500 rounded-full animate-spin mb-6 md:mb-8"></div>
            <div className="text-cyan-500 text-[10px] md:text-xs tracking-[0.5em] md:tracking-[1em] mb-3 md:mb-4 uppercase font-bold">Vectoring...</div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 md:mb-6 uppercase tracking-widest italic">{currentPlanet.name}</h2>
            <div className="h-0.5 w-48 md:w-64 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-4 md:mb-6"></div>
            <p className="text-gray-500 text-sm md:text-lg font-light italic max-w-md px-4">{currentPlanet.description}</p>
            <AutoStart onStart={() => setGameState(GameState.PLAYING)} />
          </div>
        )}

        {gameState === GameState.LEVEL_COMPLETE && (
          <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-2xl flex flex-col items-center justify-center text-center z-20 px-4">
            <h2 className="text-4xl md:text-7xl font-black text-white mb-4 uppercase italic tracking-tighter">Sector Secured</h2>
            <div className="h-1 w-48 md:w-64 bg-gradient-to-r from-cyan-500 to-white mb-8 md:mb-12"></div>
            <button 
              onClick={handleNextPlanet}
              className="group px-10 md:px-14 py-4 md:py-5 bg-white text-black hover:bg-cyan-500 hover:text-white transition-all text-lg md:text-xl font-black uppercase tracking-widest active:scale-95"
            >
              Next <span className="inline-block group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-3xl flex flex-col items-center justify-center text-center z-20 px-4">
            <div className="text-rose-500 text-4xl md:text-6xl mb-4 md:mb-6">⚠</div>
            <h2 className="text-5xl md:text-8xl font-black text-white mb-4 italic uppercase tracking-tighter">Game Over</h2>
            <p className="text-rose-400 text-base md:text-xl font-bold tracking-[0.2em] md:tracking-[0.4em] mb-8 md:mb-12 uppercase opacity-80">Simulation Terminated</p>
            <button 
              onClick={startGame}
              className="px-8 md:px-12 py-4 md:py-5 border-2 border-white text-white hover:bg-white hover:text-black transition-all text-base md:text-xl font-black uppercase tracking-widest active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {gameState === GameState.VICTORY && (
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-black to-cyan-950 flex flex-col items-center justify-center text-center z-20 px-4">
            <div className="mb-6 md:mb-8 p-4 md:p-6 bg-cyan-500/20 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.5)]">
               <svg className="w-14 h-14 md:w-20 md:h-20 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white mb-2 italic tracking-tighter uppercase">Victory!</h2>
            <p className="text-cyan-400 text-base md:text-xl mb-8 md:mb-12 tracking-[0.3em] md:tracking-[0.5em] font-bold">All Sectors Cleared</p>
            <button 
              onClick={startGame}
              className="px-12 md:px-16 py-5 md:py-6 bg-cyan-500 text-black font-black uppercase tracking-[0.1em] md:tracking-[0.2em] hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95"
            >
              Play Again
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
