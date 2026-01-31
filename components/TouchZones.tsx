import React, { useRef, useCallback, useEffect } from 'react';

interface TouchZonesProps {
  onMoveChange: (direction: { x: number; y: number }) => void;
  onFire: () => void;
  disabled?: boolean;
}

/**
 * TouchZones component for mobile game controls
 * 
 * - Left 50%: Movement zone (drag to move)
 * - Right 50%: Fire zone (tap/hold to fire)
 * 
 * Features:
 * - True multitouch support (move + fire simultaneously)
 * - Touch identifier tracking to prevent cross-zone interference
 * - No speed stacking - only updates direction state
 * - touch-action: none to disable browser gestures
 */
const TouchZones: React.FC<TouchZonesProps> = ({ onMoveChange, onFire, disabled = false }) => {
  // Track move touch separately from fire touch using identifiers
  const moveTouchRef = useRef<{
    id: number | null;
    origin: { x: number; y: number };
  }>({ id: null, origin: { x: 0, y: 0 } });
  
  const fireTouchRef = useRef<number | null>(null);
  const fireIntervalRef = useRef<number | null>(null);
  
  const maxDistance = 60; // Max drag distance for full speed

  // Calculate normalized movement direction from touch position
  const calculateMove = useCallback((touchX: number, touchY: number) => {
    const origin = moveTouchRef.current.origin;
    let dx = touchX - origin.x;
    let dy = touchY - origin.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize to -1 to 1 range, capped at maxDistance
    const normalizedX = Math.max(-1, Math.min(1, dx / maxDistance));
    const normalizedY = Math.max(-1, Math.min(1, dy / maxDistance));
    
    // Only update state - game loop handles actual movement
    onMoveChange({
      x: normalizedX,
      y: normalizedY
    });
  }, [onMoveChange, maxDistance]);

  // Start continuous firing while touch is held
  const startFiring = useCallback(() => {
    if (fireIntervalRef.current) return; // Prevent duplicate intervals
    
    onFire(); // Fire immediately on touch
    
    // Continue firing at fixed interval while held
    fireIntervalRef.current = window.setInterval(() => {
      onFire();
    }, 150); // 150ms = ~6.67 shots per second
  }, [onFire]);

  // Stop firing when touch ends
  const stopFiring = useCallback(() => {
    if (fireIntervalRef.current) {
      clearInterval(fireIntervalRef.current);
      fireIntervalRef.current = null;
    }
  }, []);

  // Global touch event handlers for move and end events
  useEffect(() => {
    if (disabled) {
      // Clean up when disabled
      stopFiring();
      return;
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Only prevent default if we have an active move touch
      if (moveTouchRef.current.id !== null) {
        e.preventDefault();
      }
      
      // Find our tracked move touch by identifier
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.identifier === moveTouchRef.current.id) {
          calculateMove(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Check each ended touch against our tracked touches
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        
        // If this was our movement touch, stop moving
        if (touch.identifier === moveTouchRef.current.id) {
          moveTouchRef.current.id = null;
          onMoveChange({ x: 0, y: 0 }); // Reset to idle
        }
        
        // If this was our fire touch, stop firing
        if (touch.identifier === fireTouchRef.current) {
          fireTouchRef.current = null;
          stopFiring();
        }
      }
    };

    // Add listeners with passive: false to allow preventDefault
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
    e.stopPropagation();
    
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
    e.stopPropagation();
    
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
      style={{ 
        touchAction: 'none',
        // Disable all browser touch behaviors
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* Left Zone - Movement (50%) */}
      <div 
        onTouchStart={handleMoveZoneTouchStart}
        className="absolute left-0 top-0 h-full"
        style={{ 
          width: '50%',
          touchAction: 'none',
        }}
      />

      {/* Right Zone - Fire (50%) */}
      <div 
        onTouchStart={handleFireZoneTouchStart}
        className="absolute right-0 top-0 h-full"
        style={{ 
          width: '50%',
          touchAction: 'none',
        }}
      />
    </div>
  );
};

export default TouchZones;
