

import React, { useState } from 'react';
import { Page, UnitSystem } from '../types.js';
import { BackIcon } from '../components/Icons.js';
import { useAppContext } from '../contexts/AppContext.js';
import { getDisplayWeight, kgToLbs } from '../utils/units.js';

const WeightInput = ({
    label,
    value, // Always lbs internally
    unitSystem,
    onChange,
}) => {
    const isMetric = unitSystem === UnitSystem.Metric;
    const displayValue = getDisplayWeight(value, unitSystem);

    const handleValueChange = (displayVal) => {
        const lbsValue = isMetric ? kgToLbs(displayVal) : displayVal;
        onChange(lbsValue);
    };

    return (
        React.createElement("div", { className: "bg-light-gray dark:bg-dark-card p-4 rounded-xl" },
            React.createElement("label", { className: "text-sm font-semibold text-text-light dark:text-dark-text-light font-montserrat" }, label),
            React.createElement("div", { className: "flex items-baseline mt-1" },
                React.createElement("input", {
                    type: "number",
                    value: displayValue,
                    onChange: (e) => handleValueChange(parseFloat(e.target.value) || 0),
                    className: "text-4xl font-bold text-text-main dark:text-dark-text-main bg-transparent w-full outline-none appearance-none",
                    style: { MozAppearance: 'textfield' } // For Firefox
                }),
                React.createElement("span", { className: "text-lg font-medium text-text-light dark:text-dark-text-light" }, isMetric ? 'kg' : 'lbs')
            )
        )
    );
};

const WeightGoalsScreen = () => {
    const { navigateTo, currentWeight, goalWeight, handleWeightUpdate: onSave, profile, triggerHapticFeedback } = useAppContext();
    const [current, setCurrent] = useState(currentWeight);
    const [goal, setGoal] = useState(goalWeight);
    const { unitSystem } = profile;
    const isMetric = unitSystem === UnitSystem.Metric;

    const handleSave = () => {
        triggerHapticFeedback();
        onSave(current, goal);
    };

    const difference = Math.abs(current - goal);
    const displayDifference = isMetric ? (difference / 2.20462).toFixed(1) : difference.toFixed(1);
    const displayUnit = isMetric ? 'kg' : 'lbs';

    return (
         React.createElement("div", { className: "p-4 flex flex-col h-full bg-background dark:bg-dark-background" },
            React.createElement("header", { className: "flex items-center mb-6" },
                React.createElement("button", { onClick: () => { triggerHapticFeedback(); navigateTo(Page.Settings); }, className: "p-2 -ml-2 transition-transform active:scale-95" },
                    React.createElement(BackIcon, { className: "w-6 h-6 text-text-main dark:text-dark-text-main" })
                ),
                React.createElement("h1", { className: "text-xl font-bold text-text-main dark:text-dark-text-main mx-auto font-montserrat" }, "Set Weight Goals"),
                React.createElement("div", { className: "w-6" })
            ),

            React.createElement("div", { className: "flex-1 bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm space-y-6" },
                React.createElement(WeightInput, {
                    label: "Current Weight",
                    value: current,
                    unitSystem: unitSystem,
                    onChange: setCurrent
                }),
                React.createElement(WeightInput, {
                    label: "Goal Weight",
                    value: goal,
                    unitSystem: unitSystem,
                    onChange: setGoal
                }),
                 React.createElement("div", { className: "text-center pt-4" },
                    React.createElement("p", { className: "text-text-light dark:text-dark-text-light" },
                        "You are ",
                        React.createElement("span", { className: "font-bold text-primary" },
                            displayDifference,
                            " ",
                            displayUnit
                        ),
                        " away from your goal."
                    )
                )
            ),

            React.createElement("div", { className: "mt-6" },
                React.createElement("button", { onClick: handleSave, className: "w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors transition-transform active:scale-95" },
                    "Update Goals"
                )
            )
        )
    );
};

export default WeightGoalsScreen;