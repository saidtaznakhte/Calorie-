

import React from 'react';
import { Page, Theme } from '../types.js';
import { BackIcon } from '../components/Icons.js';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts';
import { formatDate } from '../utils/dateUtils.js';
import { useAppContext } from '../contexts/AppContext.js';
import { getDisplayWeight, formatWeight } from '../utils/units.js';

const WeightHistoryScreen = () => {
    const { navigateTo, weightHistory: history, theme, profile, triggerHapticFeedback } = useAppContext();
    const { unitSystem } = profile;
    const isMetric = unitSystem === 'metric';

    const isDarkMode = theme === 'dark';
    const axisColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
    const tooltipStyle = {
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '0.5rem',
      border: `1px solid ${isDarkMode ? '#334151' : '#e5e7eb'}`,
      color: isDarkMode ? '#F8FAFC' : '#1E293B'
    };

    const formattedHistory = history.map(entry => ({
        ...entry,
        displayWeight: getDisplayWeight(entry.weight, unitSystem),
        formattedDate: formatDate(new Date(entry.date), { month: 'short', day: 'numeric' })
    }));

    // FIX: Corrected typo from getDisplayweight to getDisplayWeight.
    const yMin = history.length > 0 ? Math.min(...history.map(h => getDisplayWeight(h.weight, unitSystem))) - 2 : 0;
    // FIX: Corrected typo from getDisplayweight to getDisplayWeight.
    const yMax = history.length > 0 ? Math.max(...history.map(h => getDisplayWeight(h.weight, unitSystem))) + 2 : 100;

    return (
        React.createElement("div", { className: "p-4 flex flex-col h-full bg-background dark:bg-dark-background" },
            React.createElement("header", { className: "flex items-center mb-6" },
                React.createElement("button", { onClick: () => { triggerHapticFeedback(); navigateTo(Page.Settings); }, className: "p-2 -ml-2 transition-transform active:scale-95" },
                    React.createElement(BackIcon, { className: "w-6 h-6 text-text-main dark:text-dark-text-main" })
                ),
                React.createElement("h1", { className: "text-xl font-bold text-text-main dark:text-dark-text-main mx-auto font-montserrat" }, "Weight History"),
                React.createElement("div", { className: "w-6" })
            ),

            React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mb-6" },
                React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-4 font-montserrat" }, "Your Progress"),
                React.createElement("div", { style: { width: '100%', height: 250 } },
                    React.createElement(ResponsiveContainer, null,
                        React.createElement(LineChart, { data: formattedHistory, margin: { top: 5, right: 20, left: -10, bottom: 5 } },
                            React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: gridColor }),
                            React.createElement(XAxis, { dataKey: "formattedDate", fontSize: 12, tickLine: false, axisLine: false, stroke: axisColor }),
                            React.createElement(YAxis, {
                                domain: [yMin, yMax],
                                fontSize: 12,
                                tickLine: false,
                                axisLine: false,
                                stroke: axisColor,
                                unit: isMetric ? 'kg' : 'lbs'
                            }),
                            React.createElement(Tooltip, {
                                contentStyle: tooltipStyle,
                                formatter: (value) => [`${value.toFixed(1)} ${isMetric ? 'kg' : 'lbs'}`, 'Weight']
                            }),
                            React.createElement(Line, { type: "monotone", dataKey: "displayWeight", stroke: "#00C795", strokeWidth: 2, dot: { r: 4 }, activeDot: { r: 6 }, name: "Weight" })
                        )
                    )
                )
            ),

            React.createElement("div", { className: "flex-1 overflow-y-auto bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm" },
                React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-2 font-montserrat" }, "Log Entries"),
                React.createElement("div", { className: "space-y-2" },
                    history.length > 0 ? formattedHistory.slice().reverse().map((entry, index) => (
                        React.createElement("div", { key: index, className: "flex justify-between items-center py-2 border-b border-light-gray dark:border-dark-border last:border-b-0" },
                           React.createElement("p", { className: "text-text-main dark:text-dark-text-main" }, formatDate(new Date(entry.date), { weekday: 'long', month: 'long', day: 'numeric' })),
                           React.createElement("p", { className: "font-bold text-text-main dark:text-dark-text-main" }, formatWeight(entry.weight, unitSystem))
                        )
                    )) : (
                        React.createElement("p", { className: "text-center text-medium-gray dark:text-dark-gray py-8" }, "No weight entries yet.")
                    )
                )
            )
        )
    );
};

export default WeightHistoryScreen;