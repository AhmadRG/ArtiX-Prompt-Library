import React from 'react';

export default function FastBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden">
      <style>{`
        @keyframes drift {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-drift {
          animation: drift 15s infinite alternate ease-in-out;
        }
        .animate-drift-slow {
          animation: drift 20s infinite alternate-reverse ease-in-out;
        }
      `}</style>
      
      {/* Subtle dot pattern for texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)'
        }}
      />
      
      {/* Elegant, deep colored orbs - optimized for mobile (smaller blur sizes, simple transforms) */}
      <div className="absolute top-[-10%] left-[-20%] w-[90vw] h-[90vw] md:w-[50vw] md:h-[50vw] rounded-full bg-primary/10 blur-[80px] md:blur-[120px] animate-drift pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[90vw] h-[90vw] md:w-[50vw] md:h-[50vw] rounded-full bg-secondary/10 blur-[80px] md:blur-[120px] animate-drift-slow pointer-events-none" />
      
      {/* Darkmatic Overlay to blend everything smoothly */}
      <div className="absolute inset-0 bg-transparent mix-blend-overlay pointer-events-none" />
    </div>
  );
}
