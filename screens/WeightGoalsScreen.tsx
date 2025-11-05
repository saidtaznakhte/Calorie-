
import React, { useState } from 'react';
import { Page, UnitSystem } from '../types.js';
import { BackIcon } from '../components/Icons.js';
import { useAppContext } from '../contexts/AppContext.js';
import { getDisplayWeight, kgToLbs } from '../utils/units.js';

const WeightInput: React.FC<{
    label: string;
    value: number; // Always lbs internally
    unitSystem: UnitSystem;
    onChange: (lbsValue: number) => void;
}> = ({ label, value, unitSystem, onChange }) => {
    const isMetric = unitSystem === UnitSystem.Metric;
    const displayValue = getDisplayWeight(value, unitSystem);

    const handleValueChange = (displayVal: number) => {
        const lbsValue = isMetric ? kgToLbs(displayVal) : displayVal;
        onChange(lbsValue);
    };

    return (
        <div className="bg-light-gray dark:bg-dark-card p-4 rounded-xl">
            <label className="text-sm font-semibold text-text-light dark:text-dark-text-light font-montserrat">{label}</label>
            <div className="flex items-baseline mt-1">
                <input 
                    type="number"
                    value={displayValue}
                    onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
                    className="text-4xl font-bold text-text-main dark:text-dark-text-main bg-transparent w-full outline-none appearance-none"
                    style={{ MozAppearance: 'textfield' }} // For Firefox
                />
                <span className="text-lg font-medium text-text-light dark:text-dark-text-light">{isMetric ? 'kg' : 'lbs'}</span>
            </div>
        </div>
    );
};

const WeightGoalsScreen: React.FC = () => {
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
         <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-6">
                <button onClick={() => { triggerHapticFeedback(); navigateTo(Page.Settings); }} className="p-2 -ml-2 transition-transform active:scale-95">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto font-montserrat">Set Weight Goals</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex-1 bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm space-y-6">
                <WeightInput 
                    label="Current Weight"
                    value={current}
                    unitSystem={unitSystem}
                    onChange={setCurrent}
                />
                <WeightInput 
                    label="Goal Weight"
                    value={goal}
                    unitSystem={unitSystem}
                    onChange={setGoal}
                />
                 <div className="text-center pt-4">
                    <p className="text-text-light dark:text-dark-text-light">
                        You are <span className="font-bold text-primary">{displayDifference} {displayUnit}</span> away from your goal.
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <button onClick={handleSave} className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors transition-transform active:scale-95">
                    Update Goals
                </button>
            </div>
        </div>
    );
};

export default WeightGoalsScreen;