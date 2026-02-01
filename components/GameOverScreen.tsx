import React, { useState, useEffect } from 'react';
import { adMobService } from '../services/AdMobService';

interface GameOverScreenProps {
  onRestart: () => void;
  onContinue: () => void;
  score: number;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  onRestart,
  onContinue,
  score,
}) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  useEffect(() => {
    // Prepare ad when screen appears
    adMobService.prepareRewardedAd();
  }, []);

  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    
    // If not native, show progress simulation
    if (!adMobService.isNative()) {
      // Simulate ad watching with progress
      const duration = 3000;
      const interval = 50;
      let progress = 0;
      
      const timer = setInterval(() => {
        progress += (interval / duration) * 100;
        setAdProgress(Math.min(progress, 100));
        
        if (progress >= 100) {
          clearInterval(timer);
          setIsWatchingAd(false);
          onContinue();
        }
      }, interval);
      
      return;
    }

    const rewarded = await adMobService.showRewardedAd();
    setIsWatchingAd(false);
    
    if (rewarded) {
      onContinue();
    }
  };

  return (
    <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center z-20">
      <div className="text-rose-500 text-4xl mb-4">⚠</div>
      <h2 className="text-4xl sm:text-5xl font-black text-white mb-3 italic uppercase tracking-tighter">
        System Critical
      </h2>
      <p className="text-rose-400 text-sm font-bold tracking-[0.3em] mb-2 uppercase opacity-80">
        Terminated
      </p>
      <p className="text-white/60 text-xs mb-6">Score: {score.toString().padStart(6, '0')}</p>

      {isWatchingAd ? (
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-100"
              style={{ width: `${adProgress}%` }}
            />
          </div>
          <p className="text-cyan-400 text-xs uppercase tracking-widest animate-pulse">
            {adMobService.isNative() ? 'Loading Ad...' : 'Simulating Ad...'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-4">
          {/* Watch Ad to Continue Button */}
          <button
            onClick={handleWatchAd}
            className="group relative px-8 py-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white overflow-hidden transition-all duration-300 font-black tracking-widest uppercase text-sm hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10 flex items-center gap-2 justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Ad to Continue
            </span>
          </button>

          {/* Restart Button */}
          <button
            onClick={onRestart}
            className="px-8 py-3 border-2 border-white/50 text-white/80 hover:bg-white hover:text-black transition-all text-sm font-bold uppercase tracking-widest"
          >
            Restart
          </button>
        </div>
      )}

      {!adMobService.isNative() && !isWatchingAd && (
        <p className="text-white/30 text-[8px] uppercase tracking-wider mt-2">
          Real ads on mobile app
        </p>
      )}
    </div>
  );
};

export default GameOverScreen;
