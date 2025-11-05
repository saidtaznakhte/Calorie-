
import React from 'react';
import { CheckCircleIcon } from './Icons.js'; // Using CheckCircleIcon for achievement message

const ConfettiPiece = ({ style }) => (
  React.createElement("div", {
    className: "absolute w-2 h-2 rounded-full bg-primary animate-confetti-fall",
    style: style
  })
);

const ConfettiOverlay = () => {
  const confettiPieces = Array.from({ length: 50 }).map((_, i) => (
    React.createElement(ConfettiPiece, {
      key: i,
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
      }
    })
  ));

  return (
    React.createElement("div", { className: "fixed inset-0 z-50 pointer-events-none flex items-center justify-center" },
      confettiPieces,
      React.createElement("div", { className: "bg-white dark:bg-dark-card p-6 rounded-2xl shadow-xl flex items-center animate-slide-in-up text-text-main dark:text-dark-text-main" },
        React.createElement(CheckCircleIcon, { className: "w-8 h-8 text-primary mr-4 animate-checkmark-bounce" }),
        React.createElement("span", { className: "text-xl font-bold font-montserrat" }, "Achievement Unlocked!")
      )
    )
  );
};

export default ConfettiOverlay;
