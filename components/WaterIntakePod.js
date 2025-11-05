

import React from 'react';
import { WaterIcon, PlusIcon, MinusIcon, RefreshIcon } from './Icons.js'; // Import necessary icons
import { useAppContext } from '../contexts/AppContext.js';


const DEFAULT_GLASS_SIZE = 8; // fl oz

const WaterIntakePod = ({ currentIntake, goal, onAddWater, onRemoveWater, onResetWater, showToast }) => {
  const { triggerHapticFeedback } = useAppContext();
  const percentage = goal > 0 ? Math.min((currentIntake / goal) * 100, 100) : 0;
  // const totalGlasses = Math.ceil(goal / DEFAULT_GLASS_SIZE); // Not used with current design
  // const filledGlasses = Math.floor(currentIntake / DEFAULT_GLASS_SIZE); // Not used with current design

  const handleAddGlass = () => {
    triggerHapticFeedback();
    onAddWater(DEFAULT_GLASS_SIZE);
    // Toast is now handled by `handleWaterIntakeUpdate` in AppContext
  };

  const handleRemoveGlass = () => {
    triggerHapticFeedback();
    onRemoveWater(DEFAULT_GLASS_SIZE);
    // Toast is now handled by `handleWaterIntakeUpdate` in AppContext
  };

  const handleReset = () => {
    triggerHapticFeedback();
    if (window.confirm("Are you sure you want to reset your water intake for today?")) {
      onResetWater();
      showToast({ text: "Water intake reset!", type: 'info' });
    }
  };


  return (
    React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm opacity-0 animate-fade-in" },
        React.createElement("div", { className: "flex justify-between items-center mb-4" },
            React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main" }, "Hydration"),
            React.createElement("button", {
                onClick: handleReset,
                className: "p-2 rounded-full text-medium-gray dark:text-dark-gray hover:bg-light-gray dark:hover:bg-dark-border transition-colors transition-transform active:scale-95",
                "aria-label": "Reset water intake"
            },
                React.createElement(RefreshIcon, { className: "w-5 h-5" })
            )
        ),
        
        React.createElement("div", { className: "flex flex-col items-center" },
            React.createElement("div", { className: "relative w-40 h-40 flex items-center justify-center" },
                React.createElement(WaterIcon, { className: "w-full h-full text-blue-200 dark:text-blue-800 absolute opacity-70" }),
                React.createElement("div", {
                    className: "absolute bottom-0 w-full bg-fats rounded-full transition-all duration-500",
                    style: { height: `${percentage}%`, clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' }
                }),
                React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-white p-2" },
                    React.createElement("span", { className: "text-4xl font-bold drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]" }, currentIntake),
                    React.createElement("span", { className: "text-md text-white/80 drop-shadow-sm" },
                        "/ ",
                        goal,
                        " fl oz"
                    )
                )
            ),
            
            React.createElement("p", { className: "text-center font-bold text-lg text-fats mt-4" },
                percentage.toFixed(0),
                "% Complete"
            ),

            React.createElement("div", { className: "flex space-x-3 mt-4" },
                React.createElement("button", {
                    onClick: handleRemoveGlass,
                    disabled: currentIntake <= 0,
                    className: "w-16 h-10 bg-fats/10 border border-fats/30 text-fats dark:text-fats-light font-bold rounded-full text-lg\n                               transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-fats/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
                               "aria-label": `Remove ${DEFAULT_GLASS_SIZE} fl oz`
                },
                    "-",
                    DEFAULT_GLASS_SIZE
                ),
                React.createElement("button", {
                    onClick: handleAddGlass,
                    disabled: currentIntake >= goal,
                    className: "w-16 h-10 bg-fats/10 border border-fats/30 text-fats dark:text-fats-light font-bold rounded-full text-lg\n                               transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-fats/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
                               "aria-label": `Add ${DEFAULT_GLASS_SIZE} fl oz`
                },
                    "+",
                    DEFAULT_GLASS_SIZE
                )
            )
        )
    );
};

export default WaterIntakePod;