import React, { useCallback, useEffect, useRef } from 'react';

interface TouchControlsProps {
  onLeftStart: () => void;
  onLeftEnd: () => void;
  onRightStart: () => void;
  onRightEnd: () => void;
  onFire: () => void;
  isPlaying: boolean;
}

const TouchControls: React.FC<TouchControlsProps> = ({
  onLeftStart,
  onLeftEnd,
  onRightStart,
  onRightEnd,
  onFire,
  isPlaying
}) => {
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);
  const fireRef = useRef<HTMLButtonElement>(null);

  const handleTouchStart = useCallback((action: () => void) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    action();
  }, []);

  const handleTouchEnd = useCallback((action: () => void) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    action();
  }, []);

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
      <div className="flex justify-between items-end px-4 pb-4">
        {/* Left/Right Controls */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            ref={leftRef}
            onTouchStart={handleTouchStart(onLeftStart)}
            onTouchEnd={handleTouchEnd(onLeftEnd)}
            onMouseDown={handleTouchStart(onLeftStart)}
            onMouseUp={handleTouchEnd(onLeftEnd)}
            onMouseLeave={handleTouchEnd(onLeftEnd)}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-lg border-2 border-cyan-500/50 flex items-center justify-center active:bg-cyan-500/30 active:scale-95 transition-all touch-none select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            ref={rightRef}
            onTouchStart={handleTouchStart(onRightStart)}
            onTouchEnd={handleTouchEnd(onRightEnd)}
            onMouseDown={handleTouchStart(onRightStart)}
            onMouseUp={handleTouchEnd(onRightEnd)}
            onMouseLeave={handleTouchEnd(onRightEnd)}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-lg border-2 border-cyan-500/50 flex items-center justify-center active:bg-cyan-500/30 active:scale-95 transition-all touch-none select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Fire Button */}
        <button
          ref={fireRef}
          onTouchStart={handleTouchStart(onFire)}
          onMouseDown={handleTouchStart(onFire)}
          className="w-24 h-24 rounded-full bg-rose-500/20 backdrop-blur-lg border-4 border-rose-500/70 flex items-center justify-center active:bg-rose-500/50 active:scale-95 transition-all pointer-events-auto touch-none select-none shadow-[0_0_30px_rgba(244,63,94,0.4)]"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 12h5v10h6V12h5L12 2z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TouchControls;
