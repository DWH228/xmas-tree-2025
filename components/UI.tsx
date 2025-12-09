import React from 'react';
import { AppState } from '../types';

interface UIProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

const UI: React.FC<UIProps> = ({ appState, setAppState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      {/* Header */}
      <header className="flex flex-col items-start space-y-2">
        <h3 className="text-[#D4AF37] font-['Cinzel'] tracking-[0.2em] text-sm uppercase opacity-80">
          Arix Collection
        </h3>
        <h1 className="text-white font-['Playfair_Display'] text-5xl md:text-7xl font-bold italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          The Signature <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FBF5B7] to-[#D4AF37]">
            Tree
          </span>
        </h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center space-y-6 pointer-events-auto">
         <div className="flex bg-[#001a14]/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-full p-1 shadow-2xl">
            <button
                onClick={() => setAppState(AppState.SCATTERED)}
                className={`px-8 py-3 rounded-full font-['Cinzel'] text-xs tracking-widest transition-all duration-500 ${
                    appState === AppState.SCATTERED 
                    ? 'bg-[#D4AF37] text-[#00241B] shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
                    : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
                }`}
            >
                Deconstruct
            </button>
            <button
                onClick={() => setAppState(AppState.TREE_SHAPE)}
                className={`px-8 py-3 rounded-full font-['Cinzel'] text-xs tracking-widest transition-all duration-500 ${
                    appState === AppState.TREE_SHAPE 
                    ? 'bg-[#D4AF37] text-[#00241B] shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
                    : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
                }`}
            >
                Assemble
            </button>
         </div>
         <p className="text-[#D4AF37]/60 font-['Cinzel'] text-[10px] tracking-widest">
            Interactive Experience • 2024
         </p>
      </div>

      {/* Corner Decoration */}
      <div className="absolute top-0 right-0 p-12 hidden md:block opacity-30">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="#D4AF37" strokeWidth="1" />
            <path d="M50 0 L50 100 M0 50 L100 50" stroke="#D4AF37" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
};

export default UI;