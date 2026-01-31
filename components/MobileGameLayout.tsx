import React from 'react';
import TouchZones from './TouchZones';
import CRTOverlay from './CRTOverlay';
import FullscreenController from './FullscreenController';

interface MobileGameLayoutProps {
  children: React.ReactNode;
  onMoveChange: (direction: { x: number; y: number }) => void;
  onFire: () => void;
  controlsDisabled?: boolean;
}

const MobileGameLayout: React.FC<MobileGameLayoutProps> = ({
  children,
  onMoveChange,
  onFire,
  controlsDisabled = false,
}) => {
  return (
    <div className="fixed inset-0 bg-[#020205] overflow-hidden touch-none select-none">
      {/* Fullscreen Controller */}
      <FullscreenController />
      
      {/* Touch Zones Overlay - Left 50% move, Right 50% fire */}
      <TouchZones onMoveChange={onMoveChange} onFire={onFire} disabled={controlsDisabled} />
      
      {/* Game Arena - Centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative overflow-hidden"
          style={{
            width: '80%',
            maxWidth: '500px',
            aspectRatio: '1 / 1.25',
            maxHeight: '95%',
            background: '#050505',
          }}
        >
          {/* Pulsing neon cyan border */}
          <div 
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              border: '2px solid rgba(0, 255, 255, 0.6)',
              boxShadow: `
                inset 0 0 30px rgba(0, 255, 255, 0.1),
                0 0 20px rgba(0, 255, 255, 0.4),
                0 0 40px rgba(0, 255, 255, 0.2)
              `,
              animation: 'borderPulse 2s ease-in-out infinite',
            }}
          />
          
          {/* CRT Overlay */}
          <CRTOverlay />
          
          {/* Game Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes borderPulse {
          0%, 100% {
            box-shadow: 
              inset 0 0 30px rgba(0, 255, 255, 0.1),
              0 0 20px rgba(0, 255, 255, 0.4),
              0 0 40px rgba(0, 255, 255, 0.2);
            border-color: rgba(0, 255, 255, 0.6);
          }
          50% {
            box-shadow: 
              inset 0 0 40px rgba(0, 255, 255, 0.15),
              0 0 30px rgba(0, 255, 255, 0.6),
              0 0 60px rgba(0, 255, 255, 0.3);
            border-color: rgba(0, 255, 255, 0.9);
          }
        }
        
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        
        @keyframes glitch {
          0%, 90%, 100% { transform: translateX(0); }
          92% { transform: translateX(-2px); }
          94% { transform: translateX(2px); }
          96% { transform: translateX(-1px); }
          98% { transform: translateX(1px); }
        }
        
        @keyframes signalSync {
          0% { opacity: 1; }
          50% { opacity: 0.98; }
          52% { opacity: 1; }
          54% { opacity: 0.97; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MobileGameLayout;
