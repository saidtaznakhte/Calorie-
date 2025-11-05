import React from 'react';
import { FlameIcon } from './Icons.js';

const StreakCounter = ({ streak }) => {
    if (streak === 0) {
        return null;
    }

    return (
        React.createElement("div", { className: "flex items-center space-x-1 bg-secondary/10 dark:bg-secondary/20 px-3 py-1.5 rounded-full" },
            React.createElement(FlameIcon, { className: "w-5 h-5 text-secondary" }),
            React.createElement("span", { className: "font-bold text-secondary text-md" }, streak)
        )
    );
};

export default StreakCounter;
