
import React from 'react';
import { CheckCircleIcon } from './Icons'; // Using CheckCircleIcon for achievement message

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute w-2 h-2 rounded-full bg-primary animate-confetti-fall"
    style={style}
  ></div>
);

const ConfettiOverlay: React.FC = () => {
  const confettiPieces = Array.from({ length: 50 }).map((_, i) => (
    <ConfettiPiece
      key={i}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
      }}
    />
  ));

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {confettiPieces}
      <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-xl flex items-center animate-slide-in-up text-text-main dark:text-dark-text-main">
        <CheckCircleIcon className="w-8 h-8 text-primary mr-4 animate-checkmark-bounce" />
        <span className="text-xl font-bold font-montserrat">Achievement Unlocked!</span>
      </div>
    </div>
  );
};

export default ConfettiOverlay;
