

import React, { useMemo } from 'react';
import { Page } from '../types.js';
import { BackIcon } from '../components/Icons.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDate, toYYYYMMDD } from '../utils/dateUtils.js';
import { useAppContext } from '../contexts/AppContext.js';


const WaterHistoryScreen = () => {
    const { navigateTo, waterIntakeHistory: history, waterGoal, theme, triggerHapticFeedback } = useAppContext();
    const isDarkMode = theme === 'dark';
    const axisColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
    const tooltipStyle = {
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '0.5rem',
      border: `1px solid ${isDarkMode ? '#334151' : '#e5e7eb'}`,
      color: isDarkMode ? '#F8FAFC' : '#1E293B'
    };

    const last7DaysData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = toYYYYMMDD(date);
            const intake = history[dateString] || 0;
            data.push({
                date: dateString,
                intake: intake,
                goal: waterGoal,
                formattedDate: formatDate(date, { month: 'short', day: 'numeric' })
            });
        }
        return data;
    }, [history, waterGoal]);

    const loggedEntries = useMemo(() => {
        return Object.entries(history)
            .map(([date, intake]) => ({ date, intake }))
            .filter(entry => entry.intake > 0)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [history]);

    return (
        React.createElement("div", { className: "p-4 flex flex-col h-full bg-background dark:bg-dark-background" },
            React.createElement("header", { className: "flex items-center mb-6" },
                React.createElement("button", { onClick: () => { triggerHapticFeedback(); navigateTo(Page.Settings); }, className: "p-2 -ml-2 transition-transform active:scale-95" },
                    React.createElement(BackIcon, { className: "w-6 h-6 text-text-main dark:text-dark-text-main" })
                ),
                React.createElement("h1", { className: "text-xl font-bold text-text-main dark:text-dark-text-main mx-auto font-montserrat" }, "Water Intake History"),
                React.createElement("div", { className: "w-6" })
            ),

            React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mb-6" },
                React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-4 font-montserrat" }, "Last 7 Days (fl oz)"),
                React.createElement("div", { style: { width: '100%', height: 250 } },
                    React.createElement(ResponsiveContainer, null,
                        React.createElement(BarChart, { data: last7DaysData, margin: { top: 5, right: 20, left: -10, bottom: 5 } },
                            React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: gridColor }),
                            React.createElement(XAxis, { dataKey: "formattedDate", fontSize: 12, tickLine: false, axisLine: false, stroke: axisColor }),
                            React.createElement(YAxis, { fontSize: 12, tickLine: false, axisLine: false, stroke: axisColor }),
                            React.createElement(Tooltip, { contentStyle: tooltipStyle, cursor: { fill: isDarkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(229, 231, 235, 0.4)'} }),
                            React.createElement(Bar, { dataKey: "intake", fill: "#3B82F6", name: "Intake", radius: [4, 4, 0, 0] })
                        )
                    )
                )
            ),

            React.createElement("div", { className: "flex-1 overflow-y-auto bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm" },
                React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-2 font-montserrat" }, "Log Entries"),
                loggedEntries.length > 0 ? (
                    React.createElement("div", { className: "space-y-2" },
                        loggedEntries.map((entry, index) => (
                            React.createElement("div", { key: index, className: "flex justify-between items-center py-2 border-b border-light-gray dark:border-dark-border last:border-b-0" },
                               React.createElement("p", { className: "text-text-main dark:text-dark-text-main" }, formatDate(new Date(entry.date), { weekday: 'long', month: 'long', day: 'numeric' })),
                               React.createElement("p", { className: "font-bold text-text-main dark:text-dark-text-main" },
                                   entry.intake,
                                   " fl oz"
                               )
                            )
                        ))
                    )
                ) : (
                    React.createElement("div", { className: "text-center py-10 text-medium-gray dark:text-dark-gray" },
                        React.createElement("p", null, "No water intake logged yet.")
                    )
                )
            )
        )
    );
};

export default WaterHistoryScreen;