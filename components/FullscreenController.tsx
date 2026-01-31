import React, { useState, useEffect, useCallback } from 'react';

interface FullscreenControllerProps {
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

const FullscreenController: React.FC<FullscreenControllerProps> = ({ onFullscreenChange }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const requestFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }

      // Lock orientation to landscape if supported
      if (screen.orientation && (screen.orientation as any).lock) {
        try {
          await (screen.orientation as any).lock('landscape');
        } catch (e) {
          console.log('Orientation lock not supported');
        }
      }

      setIsFullscreen(true);
      setShowPrompt(false);
      onFullscreenChange?.(true);
    } catch (err) {
      console.log('Fullscreen request failed:', err);
    }
  }, [onFullscreenChange]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }

      // Unlock orientation
      if (screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }

      setIsFullscreen(false);
      onFullscreenChange?.(false);
    } catch (err) {
      console.log('Exit fullscreen failed:', err);
    }
  }, [onFullscreenChange]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement = document.fullscreenElement || 
                       (document as any).webkitFullscreenElement ||
                       (document as any).msFullscreenElement;
      setIsFullscreen(!!fsElement);
      onFullscreenChange?.(!!fsElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [onFullscreenChange]);

  // Dismiss prompt after first interaction
  useEffect(() => {
    const dismissPrompt = () => setShowPrompt(false);
    const timer = setTimeout(dismissPrompt, 10000); // Auto-dismiss after 10s
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Fullscreen prompt - shows on mobile */}
      {showPrompt && !isFullscreen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={requestFullscreen}
        >
          <div className="text-center p-8 max-w-sm">
            {/* Glitch animation container */}
            <div className="relative mb-6">
              <div 
                className="text-6xl mb-2"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.5))',
                }}
              >
                📱
              </div>
              <div 
                className="absolute inset-0 text-6xl opacity-50"
                style={{
                  animation: 'glitchText 0.3s infinite',
                  color: '#ff00ff',
                }}
              >
                📱
              </div>
            </div>
            
            <h2 
              className="text-2xl font-black text-white mb-3 uppercase tracking-wider"
              style={{ 
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.7)'
              }}
            >
              Tap to Enter
            </h2>
            
            <p 
              className="text-cyan-400 text-sm mb-6 tracking-wide"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Fullscreen + Landscape Mode
            </p>
            
            <button
              onClick={requestFullscreen}
              className="relative px-8 py-4 overflow-hidden group"
              style={{
                border: '2px solid rgba(0, 255, 255, 0.6)',
                background: 'transparent',
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
              }}
            >
              <div 
                className="absolute inset-0 bg-cyan-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
              />
              <span 
                className="relative z-10 text-cyan-400 group-hover:text-black font-bold uppercase tracking-widest text-sm transition-colors"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                Initialize
              </span>
            </button>
            
            <p 
              className="text-gray-600 text-xs mt-6 tracking-wider"
              onClick={(e) => {
                e.stopPropagation();
                setShowPrompt(false);
              }}
            >
              Tap anywhere or wait to skip
            </p>
          </div>
        </div>
      )}

      {/* Floating fullscreen toggle button */}
      <button
        onClick={isFullscreen ? exitFullscreen : requestFullscreen}
        className="fixed top-2 right-2 z-40 p-2 rounded transition-all duration-200 hover:scale-110"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(0, 255, 255, 0.4)',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)',
        }}
      >
        {isFullscreen ? (
          <svg 
            className="w-5 h-5 text-cyan-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 9L4 4m0 0v4m0-4h4m6 6l5 5m0 0v-4m0 4h-4M9 15l-5 5m0 0v-4m0 4h4m6-6l5-5m0 0v4m0-4h-4" 
            />
          </svg>
        ) : (
          <svg 
            className="w-5 h-5 text-cyan-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" 
            />
          </svg>
        )}
      </button>

      {/* CSS for glitch animation */}
      <style>{`
        @keyframes glitchText {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
        }
      `}</style>
    </>
  );
};

export default FullscreenController;
