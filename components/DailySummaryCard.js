import React from 'react';
import { FlameIcon } from './Icons.js';

const StatItem = ({ label, value, icon }) => (
    React.createElement("div", { className: "flex flex-col items-center w-20" },
        React.createElement("div", { className: "flex items-center text-sm text-text-light dark:text-dark-text-light whitespace-nowrap" },
            icon && React.createElement("div", { className: "mr-1.5" }, icon),
            React.createElement("span", null, label)
        ),
        React.createElement("p", { className: "text-2xl font-bold text-text-main dark:text-dark-text-main truncate" }, Math.round(value))
    )
);

const DailySummaryCard = ({ caloriesIn, caloriesOut }) => {
    const netCalories = caloriesIn - caloriesOut;

    return (
        React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm flex justify-around items-center" },
            React.createElement(StatItem, { label: "Consumed", value: caloriesIn }),
            React.createElement("div", { className: "text-4xl font-light text-light-gray dark:text-dark-border" }, "-"),
            React.createElement(StatItem, { label: "Burned", value: caloriesOut, icon: React.createElement(FlameIcon, { className: "w-4 h-4 text-secondary" }) }),
            React.createElement("div", { className: "text-4xl font-light text-light-gray dark:text-dark-border" }, "="),
            React.createElement("div", { className: "flex flex-col items-center w-20" },
                React.createElement("span", { className: "text-sm text-text-light dark:text-dark-text-light" }, "Net"),
                React.createElement("p", { className: "text-2xl font-bold text-primary truncate" }, Math.round(netCalories))
            )
        )
    );
};

export default DailySummaryCard;
