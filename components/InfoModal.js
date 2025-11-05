

import React from 'react';
/* eslint-disable react/react-in-jsx-scope */ 
import { useAppContext } from '../contexts/AppContext.js';

// Removed: TypeScript interface definition
// interface InfoModalProps {
//   title: string;
//   onClose: () => void;
//   children: React.ReactNode;
// }

const InfoModal = ({ title, onClose, children }) => {
  const { triggerHapticFeedback } = useAppContext();
  const handleCloseClick = () => {
    triggerHapticFeedback();
    onClose();
  };

  return (
    React.createElement("div", {
      className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in",
      onClick: handleCloseClick,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "info-modal-title"
    },
      React.createElement("div", {
        className: "bg-white dark:bg-gray-800 rounded-2xl p-6 w-11/12 max-w-sm animate-slide-in-up",
        onClick: (e) => e.stopPropagation()
      },
        React.createElement("h2", { id: "info-modal-title", className: "text-xl font-bold text-text-main dark:text-gray-100 mb-4 text-center font-montserrat" }, title),
        React.createElement("div", { className: "text-text-light dark:text-gray-300 space-y-3 text-center mb-6" },
          children
        ),
        React.createElement("button", {
          onClick: handleCloseClick,
          className: "w-full bg-primary text-white font-bold py-3 rounded-xl text-lg transition-transform active:scale-95",
          "aria-label": "Close modal"
        },
          "Got it"
        )
      )
    )
  );
};

export default InfoModal;