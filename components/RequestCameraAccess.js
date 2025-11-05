

import React from 'react';
import { CameraIcon } from './Icons.js';
import { useAppContext } from '../contexts/AppContext.js';


const RequestCameraAccess = ({ onGrant, onDeny, featureName, featureDescription }) => {
  const { triggerHapticFeedback } = useAppContext();
  return (
    React.createElement("div", { className: "absolute inset-0 bg-white dark:bg-gray-900 z-40 flex flex-col items-center justify-center p-8 text-center animate-fade-in" },
      React.createElement("div", { className: "w-24 h-24 bg-primary-light dark:bg-primary/20 rounded-full flex items-center justify-center mb-6" },
        React.createElement(CameraIcon, { className: "w-12 h-12 text-primary" })
      ),
      React.createElement("h2", { className: "text-2xl font-bold text-text-main dark:text-gray-100 mb-2 font-montserrat" },
        "Enable Camera for ",
        featureName
      ),
      React.createElement("p", { className: "text-text-light dark:text-gray-400 mb-8 max-w-sm" }, featureDescription),
      React.createElement("button", {
        onClick: () => { triggerHapticFeedback(); onGrant(); },
        className: "w-full max-w-xs bg-primary text-white font-bold py-3 px-6 rounded-xl text-lg transition-transform hover:scale-105 active:scale-95 mb-4"
      },
        "Continue"
      ),
      React.createElement("button", {
        onClick: () => { triggerHapticFeedback(); onDeny(); },
        className: "w-full max-w-xs text-text-light dark:text-gray-400 font-semibold py-3 px-6 rounded-xl text-md transition-transform active:scale-95"
      },
        "Not Now"
      )
    )
  );
};

export default RequestCameraAccess;