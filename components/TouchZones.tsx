import React, { useRef, useCallback, useEffect } from 'react';

interface TouchZonesProps {
  onMoveChange: (direction: { x: number; y: number }) => void;
  onFire: () => void;
  disabled?: boolean;
}

const TouchZones: React.FC<TouchZonesProps> = ({ onMoveChange, onFire, disabled = false }) => {
  // Separate refs for each zone's active touch
  const moveTouchRef = useRef<{
    id: number | null;
    origin: { x: number; y: number };
  }>({ id: null, origin: { x: 0, y: 0 } });
  
  const fireTouchRef = useRef<number | null>(null);
  const fireIntervalRef = useRef<number | null>(null);
  
  const maxDistance = 50;

  // Calculate movement from touch position
  const calculateMove = useCallback((touchX: number, touchY: number) => {
    const origin = moveTouchRef.current.origin;
    let dx = touchX - origin.x;
    let dy = touchY - origin.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance;
      dy = (dy / distance) * maxDistance;
    }
    
    onMoveChange({
      x: dx / maxDistance,
      y: dy / maxDistance
    });
  }, [onMoveChange, maxDistance]);

  // Start continuous firing
  const startFiring = useCallback(() => {
    if (fireIntervalRef.current) return;
    onFire(); // Fire immediately
    fireIntervalRef.current = window.setInterval(() => {
      onFire();
    }, 150); // Fire every 150ms while held
  }, [onFire]);

  // Stop continuous firing
  const stopFiring = useCallback(() => {
    if (fireIntervalRef.current) {
      clearInterval(fireIntervalRef.current);
      fireIntervalRef.current = null;
    }
  }, []);

  // Global touch handlers
  useEffect(() => {
    if (disabled) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      // Only process movement if we have an active move touch
      if (moveTouchRef.current.id === null) return;
      
      // Find our tracked move touch
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === moveTouchRef.current.id) {
          calculateMove(e.touches[i].clientX, e.touches[i].clientY);
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Check each ended touch
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        
        // If this was our movement touch, stop moving
        if (touch.identifier === moveTouchRef.current.id) {
          moveTouchRef.current.id = null;
          onMoveChange({ x: 0, y: 0 });
        }
        
        // If this was our fire touch, stop firing
        if (touch.identifier === fireTouchRef.current) {
          fireTouchRef.current = null;
          stopFiring();
        }
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      stopFiring();
    };
  }, [disabled, calculateMove, onMoveChange, stopFiring]);

  // Handle touch start on left zone (movement)
  const handleMoveZoneTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    
    // Only track if we don't already have a move touch
    if (moveTouchRef.current.id !== null) return;
    
    const touch = e.changedTouches[0];
    moveTouchRef.current = {
      id: touch.identifier,
      origin: { x: touch.clientX, y: touch.clientY }
    };
  }, [disabled]);

  // Handle touch start on right zone (firing)
  const handleFireZoneTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    
    // Only track if we don't already have a fire touch
    if (fireTouchRef.current !== null) return;
    
    const touch = e.changedTouches[0];
    fireTouchRef.current = touch.identifier;
    startFiring();
  }, [disabled, startFiring]);

  // Don't render when disabled
  if (disabled) return null;

  return (
    <div 
      className="fixed inset-0 z-40"
      style={{ touchAction: 'none' }}
    >
      {/* Left Zone - Movement (50%) */}
      <div 
        onTouchStart={handleMoveZoneTouchStart}
        className="absolute left-0 top-0 h-full"
        style={{ 
          width: '50%',
          touchAction: 'none'
        }}
      />

      {/* Right Zone - Fire (50%) */}
      <div 
        onTouchStart={handleFireZoneTouchStart}
        className="absolute right-0 top-0 h-full"
        style={{ 
          width: '50%',
          touchAction: 'none'
        }}
      />
    </div>
  );
};

export default TouchZones;
