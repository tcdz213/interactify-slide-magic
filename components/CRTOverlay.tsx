import React from 'react';

const CRTOverlay: React.FC = () => {
  return (
    <>
      {/* Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15) 0px,
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          )`,
        }}
      />
      
      {/* Moving scanline */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
      >
        <div 
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
          style={{
            animation: 'scanline 4s linear infinite',
          }}
        />
      </div>
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
      
      {/* CRT flicker overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          background: 'linear-gradient(90deg, transparent 50%, rgba(0, 255, 255, 0.1) 50%)',
          backgroundSize: '4px 100%',
        }}
      />
    </>
  );
};

export default CRTOverlay;
