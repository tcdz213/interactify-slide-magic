import React, { useRef, useState, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const maxDistance = 40;

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance;
      dy = (dy / distance) * maxDistance;
    }
    
    setKnobPos({ x: dx, y: dy });
    onMove({ 
      x: dx / maxDistance, 
      y: dy / maxDistance 
    });
  }, [onMove, maxDistance]);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    setIsActive(true);
    const point = 'touches' in e ? e.touches[0] : e;
    handleInteraction(point.clientX, point.clientY);
  }, [handleInteraction]);

  const handleMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isActive) return;
    const point = 'touches' in e ? e.touches[0] : e;
    handleInteraction(point.clientX, point.clientY);
  }, [isActive, handleInteraction]);

  const handleEnd = useCallback(() => {
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  }, [onMove]);

  useEffect(() => {
    if (isActive) {
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('mouseup', handleEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [isActive, handleMove, handleEnd]);

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div
        ref={containerRef}
        onTouchStart={handleStart}
        onMouseDown={handleStart}
        className="relative cursor-pointer select-none touch-none"
        style={{ width: 100, height: 100 }}
      >
        {/* Outer ring - glowing outline */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-150"
          style={{
            border: '2px solid rgba(0, 255, 255, 0.4)',
            boxShadow: isActive 
              ? '0 0 20px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(0, 255, 255, 0.1)' 
              : '0 0 10px rgba(0, 255, 255, 0.3)',
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 70%)',
          }}
        />
        
        {/* Direction indicators */}
        {['top', 'bottom', 'left', 'right'].map((dir) => (
          <div
            key={dir}
            className="absolute"
            style={{
              [dir]: 8,
              left: dir === 'left' ? 8 : dir === 'right' ? 'auto' : '50%',
              right: dir === 'right' ? 8 : 'auto',
              transform: dir === 'top' || dir === 'bottom' ? 'translateX(-50%)' : 'none',
              width: dir === 'top' || dir === 'bottom' ? 12 : 4,
              height: dir === 'top' || dir === 'bottom' ? 4 : 12,
              background: 'rgba(0, 255, 255, 0.3)',
              borderRadius: 2,
            }}
          />
        ))}
        
        {/* Knob */}
        <div
          className="absolute rounded-full transition-transform duration-75"
          style={{
            width: 40,
            height: 40,
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px)) scale(${isActive ? 1.15 : 1})`,
            background: 'radial-gradient(circle at 30% 30%, rgba(0, 255, 255, 0.9), rgba(0, 200, 200, 0.6))',
            boxShadow: isActive 
              ? '0 0 30px rgba(0, 255, 255, 0.9), 0 0 60px rgba(0, 255, 255, 0.5)' 
              : '0 0 15px rgba(0, 255, 255, 0.6)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Inner glow core */}
          <div 
            className="absolute inset-2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VirtualJoystick;
