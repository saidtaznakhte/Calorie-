
import React, { useState, useMemo, useEffect } from 'react';
/* eslint-disable react/react-in-jsx-scope */ 
import { Page, ActivityType } from '../types.js';
import { BackIcon, PlusIcon } from '../components/Icons.js';
import { useAppContext } from '../contexts/AppContext.js';
import { toYYYYMMDD } from '../utils/dateUtils.js';

const defaultActivityOptions = [
    { type: ActivityType.Running, emoji: '🏃', met: 9.8 },
    { type: ActivityType.Walking, emoji: '🚶', met: 3.5 },
    { type: ActivityType.Cycling, emoji: '🚴', met: 7.5 },
    { type: ActivityType.WeightLifting, emoji: '🏋️', met: 3.5 },
    { type: ActivityType.Yoga, emoji: '🧘', met: 2.5 },
    { type: ActivityType.Swimming, emoji: '🏊', met: 7.0 },
];

const ActivityButton = ({
    activity,
    isSelected,
    onSelect,
}) => {
    const { triggerHapticFeedback } = useAppContext();
    return (
    React.createElement("button", {
        onClick: () => { triggerHapticFeedback(); onSelect(); },
        className: `flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 w-28 flex-shrink-0 transition-transform active:scale-95
            ${isSelected 
                ? 'bg-primary-light dark:bg-primary/30 border-primary scale-105 shadow-lg' 
                : 'bg-card dark:bg-dark-card border-transparent hover:border-primary/50'
            }`
    },
        React.createElement("span", { className: "text-4xl mb-2" }, activity.emoji),
        React.createElement("span", { className: "font-semibold text-sm text-text-main dark:text-dark-text-main text-center" }, activity.type)
    )
);
}

export const LogActivityScreen = () => {
    const { navigateTo, handleActivityLogged, currentWeight, customActivities, handleCustomActivityAdd, triggerHapticFeedback } = useAppContext();
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newActivity, setNewActivity] = useState({ type: '', emoji: '🏃', met: '' });

    const allActivities = useMemo(() => {
        return [...defaultActivityOptions, ...(customActivities || [])];
    }, [customActivities]);

    const totalDurationInMinutes = useMemo(() => {
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        return (h * 60) + m;
    }, [hours, minutes]);

    const caloriesBurned = useMemo(() => {
        if (!selectedActivity || totalDurationInMinutes <= 0 || currentWeight <= 0) {
            return 0;
        }
        // MET formula: MET * weight(kg) * duration(hours)
        const weightInKg = currentWeight / 2.20462;
        const durationInHours = totalDurationInMinutes / 60;
        const calories = selectedActivity.met * weightInKg * durationInHours;
        return Math.round(calories);
    }, [selectedActivity, totalDurationInMinutes, currentWeight]);

    const handleLog = () => {
        triggerHapticFeedback();
        if (!selectedActivity || totalDurationInMinutes <= 0) {
            alert('Please select an activity and enter a valid duration.');
            return;
        }

        handleActivityLogged({
            name: `${selectedActivity.type}`,
            type: selectedActivity.type,
            duration: totalDurationInMinutes,
            caloriesBurned,
            date: toYYYYMMDD(new Date()),
        });
    };
    
    const handleCloseModal = () => {
        triggerHapticFeedback();
        setIsModalOpen(false);
        setNewActivity({ type: '', emoji: '🏃', met: '' }); // Reset form
    };

    const handleSaveNewActivity = () => {
        triggerHapticFeedback();
        const metValue = parseFloat(newActivity.met);
        if (newActivity.type.trim() && newActivity.emoji && !isNaN(metValue) && metValue > 0) {
            handleCustomActivityAdd({
                type: newActivity.type.trim(),
                emoji: newActivity.emoji,
                met: metValue,
            });
            handleCloseModal();
        } else {
            alert('Please fill in all fields correctly. MET must be a positive number.');
        }
    };


    return (
        React.createElement("div", { className: "p-4 flex flex-col h-full bg-background dark:bg-dark-background" },
            React.createElement("header", { className: "flex items-center mb-6" },
                React.createElement("button", { onClick: () => { triggerHapticFeedback(); navigateTo(Page.Dashboard); }, className: "p-2 -ml-2 transition-transform active:scale-95" },
                    React.createElement(BackIcon, { className: "w-6 h-6 text-text-main dark:text-dark-text-main" })
                ),
                React.createElement("h1", { className: "text-xl font-bold text-text-main dark:text-dark-text-main mx-auto font-montserrat" }, "Log Activity"),
                React.createElement("div", { className: "w-6" })
            ),

            React.createElement("div", { className: "flex-1 overflow-y-auto" },
                React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm mb-6" },
                    React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-4 font-montserrat" }, "Choose Your Activity"),
                    React.createElement("div", { className: "flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6" },
                        allActivities.map(activity => (
                            React.createElement(ActivityButton, { 
                                key: activity.type,
                                activity: activity,
                                isSelected: selectedActivity?.type === activity.type,
                                onSelect: () => setSelectedActivity(activity)
                            })
                        )),
                         React.createElement("button", {
                            onClick: () => { triggerHapticFeedback(); setIsModalOpen(true); },
                            className: "flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 w-28 flex-shrink-0 transition-colors hover:border-primary hover:text-primary transition-transform active:scale-95"
                        },
                            React.createElement(PlusIcon, { className: "w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" }),
                            React.createElement("span", { className: "font-semibold text-sm text-center" }, "Add New")
                        )
                    )
                ),

                selectedActivity && (
                    React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm animate-fade-in" },
                        React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-4 font-montserrat" }, "Duration"),
                        React.createElement("div", { className: "flex items-baseline justify-center bg-light-gray dark:bg-dark-border p-4 rounded-xl" },
                            React.createElement("input", { 
                                type: "number",
                                value: hours,
                                onChange: (e) => setHours(e.target.value.replace(/[^0-9]/g, '')),
                                placeholder: "0",
                                "aria-label": "Hours",
                                className: "text-4xl font-bold text-text-main dark:text-dark-text-main bg-transparent w-24 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            }),
                            React.createElement("span", { className: "text-2xl font-medium text-text-light dark:text-dark-text-light mx-1" }, "h"),
                            React.createElement("input", { 
                                type: "number",
                                value: minutes,
                                onChange: (e) => setMinutes(e.target.value.replace(/[^0-9]/g, '')),
                                placeholder: "00",
                                "aria-label": "Minutes",
                                className: "text-4xl font-bold text-text-main dark:text-dark-text-main bg-transparent w-24 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            }),
                             React.createElement("span", { className: "text-2xl font-medium text-text-light dark:text-dark-text-light mx-1" }, "m")
                        ),
                        React.createElement("p", { className: "text-center text-text-light dark:text-dark-text-light mt-4" },
                            "Estimated ",
                            React.createElement("span", { className: "font-bold text-secondary" }, caloriesBurned),
                            " calories burned"
                        )
                    )
                )
            ),

            React.createElement("div", { className: "mt-6" },
                React.createElement("button", { 
                    onClick: handleLog, 
                    disabled: !selectedActivity || totalDurationInMinutes <= 0,
                    className: "w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors disabled:bg-gray-300 dark:disabled:bg-dark-border disabled:cursor-not-allowed transition-transform active:scale-95"
                },
                    "Log Activity"
                )
            ),

            isModalOpen && (
                React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in", onClick: handleCloseModal },
                    React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-6 shadow-xl w-11/12 max-w-sm animate-slide-in-up", onClick: (e) => e.stopPropagation() },
                        React.createElement("h3", { className: "text-xl font-bold text-text-main dark:text-dark-text-main mb-6 font-montserrat" }, "Add Custom Activity"),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2" }, "Activity Name"),
                                React.createElement("input", { type: "text", value: newActivity.type, onChange: (e) => setNewActivity(s => ({...s, type: e.target.value})), placeholder: "e.g., Rock Climbing", className: "w-full bg-light-gray dark:bg-dark-border p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" })
                            ),
                            React.createElement("div", { className: "flex gap-4" },
                                React.createElement("div", { className: "w-1/2" },
                                    React.createElement("label", { className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2" }, "Emoji"),
                                    React.createElement("input", { type: "text", value: newActivity.emoji, onChange: (e) => setNewActivity(s => ({...s, emoji: e.target.value})), maxLength: 2, className: "w-full bg-light-gray dark:bg-dark-border p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none text-center" })
                                ),
                                React.createElement("div", { className: "w-1/2" },
                                    React.createElement("label", { className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2" }, "MET Value"),
                                    React.createElement("input", { type: "number", value: newActivity.met, onChange: (e) => setNewActivity(s => ({...s, met: e.target.value})), placeholder: "e.g., 8.0", className: "w-full bg-light-gray dark:bg-dark-border p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" })
                                )
                            ),
                             React.createElement("p", { className: "text-xs text-text-light dark:text-dark-text-light pt-1" },
                                "MET is a measure of intensity. Walking is 3.5, running is 9.8. Search online for accurate values."
                            )
                        ),
                        React.createElement("div", { className: "flex gap-4 mt-6" },
                            React.createElement("button", { onClick: handleCloseModal, className: "flex-1 py-3 rounded-xl bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main font-semibold transition-transform active:scale-95" }, "Cancel"),
                            React.createElement("button", { onClick: handleSaveNewActivity, className: "flex-1 py-3 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-95" }, "Save")
                        )
                    )
                )
            )
        )
    );
};
