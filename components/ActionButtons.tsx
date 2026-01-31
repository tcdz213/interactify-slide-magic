import React, { useState } from 'react';

interface ActionButtonsProps {
  onBlaster: () => void;
  onDodge: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onBlaster, onDodge }) => {
  const [blasterActive, setBlasterActive] = useState(false);
  const [dodgeActive, setDodgeActive] = useState(false);

  const handleBlasterStart = () => {
    setBlasterActive(true);
    onBlaster();
  };

  const handleBlasterEnd = () => {
    setBlasterActive(false);
  };

  const handleDodgeStart = () => {
    setDodgeActive(true);
    onDodge();
  };

  const handleDodgeEnd = () => {
    setDodgeActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 pr-2">
      {/* Blaster Button - Large, top */}
      <button
        onTouchStart={handleBlasterStart}
        onTouchEnd={handleBlasterEnd}
        onMouseDown={handleBlasterStart}
        onMouseUp={handleBlasterEnd}
        onMouseLeave={handleBlasterEnd}
        className="relative select-none touch-none active:scale-95 transition-transform"
        style={{ width: 80, height: 80 }}
      >
        {/* Outer glow ring */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-100"
          style={{
            border: '3px solid rgba(255, 0, 255, 0.6)',
            boxShadow: blasterActive 
              ? '0 0 40px rgba(255, 0, 255, 0.9), 0 0 80px rgba(255, 0, 255, 0.5), inset 0 0 30px rgba(255, 0, 255, 0.4)' 
              : '0 0 20px rgba(255, 0, 255, 0.6), 0 0 40px rgba(255, 0, 255, 0.3)',
            background: blasterActive 
              ? 'radial-gradient(circle, rgba(255, 0, 255, 0.3) 0%, transparent 70%)' 
              : 'radial-gradient(circle, rgba(255, 0, 255, 0.1) 0%, transparent 70%)',
          }}
        />
        
        {/* Inner button */}
        <div 
          className="absolute rounded-full flex items-center justify-center transition-all duration-100"
          style={{
            inset: 8,
            background: blasterActive 
              ? 'radial-gradient(circle at 30% 30%, rgba(255, 100, 255, 0.9), rgba(255, 0, 255, 0.7))' 
              : 'radial-gradient(circle at 30% 30%, rgba(255, 0, 255, 0.4), rgba(200, 0, 200, 0.2))',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: blasterActive ? 'inset 0 0 20px rgba(255, 255, 255, 0.3)' : 'none',
          }}
        >
          <span 
            className="text-white font-bold text-lg tracking-wider"
            style={{ 
              textShadow: '0 0 10px rgba(255, 0, 255, 0.8)',
              fontFamily: 'Orbitron, sans-serif'
            }}
          >
            A
          </span>
        </div>
        
        {/* Label */}
        <div 
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest whitespace-nowrap"
          style={{ 
            color: 'rgba(255, 0, 255, 0.7)',
            fontFamily: 'Orbitron, sans-serif',
            textShadow: '0 0 5px rgba(255, 0, 255, 0.5)'
          }}
        >
          Blaster
        </div>
      </button>

      {/* Dodge Button - Smaller, offset left */}
      <button
        onTouchStart={handleDodgeStart}
        onTouchEnd={handleDodgeEnd}
        onMouseDown={handleDodgeStart}
        onMouseUp={handleDodgeEnd}
        onMouseLeave={handleDodgeEnd}
        className="relative select-none touch-none active:scale-95 transition-transform"
        style={{ 
          width: 65, 
          height: 65,
          marginRight: 15, // Offset 15px to the left for thumb curve
        }}
      >
        {/* Outer glow ring */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-100"
          style={{
            border: '2px solid rgba(255, 0, 255, 0.5)',
            boxShadow: dodgeActive 
              ? '0 0 30px rgba(255, 0, 255, 0.8), 0 0 60px rgba(255, 0, 255, 0.4), inset 0 0 20px rgba(255, 0, 255, 0.3)' 
              : '0 0 15px rgba(255, 0, 255, 0.5), 0 0 30px rgba(255, 0, 255, 0.2)',
            background: dodgeActive 
              ? 'radial-gradient(circle, rgba(255, 0, 255, 0.25) 0%, transparent 70%)' 
              : 'radial-gradient(circle, rgba(255, 0, 255, 0.08) 0%, transparent 70%)',
          }}
        />
        
        {/* Inner button */}
        <div 
          className="absolute rounded-full flex items-center justify-center transition-all duration-100"
          style={{
            inset: 6,
            background: dodgeActive 
              ? 'radial-gradient(circle at 30% 30%, rgba(255, 100, 255, 0.8), rgba(255, 0, 255, 0.6))' 
              : 'radial-gradient(circle at 30% 30%, rgba(255, 0, 255, 0.35), rgba(200, 0, 200, 0.15))',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: dodgeActive ? 'inset 0 0 15px rgba(255, 255, 255, 0.2)' : 'none',
          }}
        >
          <span 
            className="text-white font-bold text-sm tracking-wider"
            style={{ 
              textShadow: '0 0 8px rgba(255, 0, 255, 0.7)',
              fontFamily: 'Orbitron, sans-serif'
            }}
          >
            B
          </span>
        </div>
        
        {/* Label */}
        <div 
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-widest whitespace-nowrap"
          style={{ 
            color: 'rgba(255, 0, 255, 0.6)',
            fontFamily: 'Orbitron, sans-serif',
            textShadow: '0 0 4px rgba(255, 0, 255, 0.4)'
          }}
        >
          Dodge
        </div>
      </button>
    </div>
  );
};

export default ActionButtons;
