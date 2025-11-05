

import React, { useState, useMemo, useEffect } from 'react';
import { toYYYYMMDD, formatDate } from '../utils/dateUtils.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useAppContext } from '../contexts/AppContext.js';
import { formatWeight, getDisplayWeight } from '../utils/units.js';
import { getAIPersonalizedSuggestion } from '../services/geminiService.js';
import { BarChartIcon } from '../components/Icons.js';
import { usePullToRefresh } from '../hooks/usePullToRefresh.js';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator.js';
import ProgressSkeleton from '../components/ProgressSkeleton.js';

const StatCard = ({ label, value, children }) => (
    React.createElement("div", { className: "bg-card dark:bg-dark-card p-4 rounded-2xl flex-1 shadow-sm" },
        React.createElement("p", { className: "text-sm text-text-light dark:text-dark-text-light" }, label),
        children ?? React.createElement("p", { className: "text-2xl font-bold text-text-main dark:text-dark-text-main" }, value)
    )
);

const BmiIndicator = ({ category }) => {
    const categoryStyles = {
        'Underweight': { dot: 'bg-fats', text: 'text-fats' },
        'Healthy': { dot: 'bg-primary', text: 'text-primary' },
        'Overweight': { dot: 'bg-secondary', text: 'text-secondary' },
        'Obese': { dot: 'bg-protein', text: 'text-protein' },
    };

    const styles = categoryStyles[category] || { dot: 'bg-medium-gray', text: 'text-medium-gray' };

    return (
        React.createElement("div", { className: "flex items-center gap-1.5" },
            React.createElement("div", { className: `w-2.5 h-2.5 rounded-full ${styles.dot}` }),
            React.createElement("span", { className: `text-sm font-semibold ${styles.text}` }, category)
        )
    );
};

const AISuggestionCard = ({ suggestions, isLoading, error, onGenerate, initialSuggestions, hasGenerated }) => {
    const { triggerHapticFeedback } = useAppContext();
    const displaySuggestions = hasGenerated ? suggestions : (suggestions || initialSuggestions);

    return (
        React.createElement("div", { className: "bg-card dark:bg-dark-card p-4 rounded-2xl shadow-sm" },
            React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-4 flex items-center font-montserrat" },
                "💡 AI-Powered Insights"
            ),
            isLoading ? (
                React.createElement("div", { className: "flex items-center justify-center h-24" },
                    React.createElement("div", { className: "w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" }),
                    React.createElement("p", { className: "ml-3 text-text-light dark:text-dark-text-light" }, "Analyzing your week...")
                )
            ) : error ? (
                React.createElement("div", { className: "text-center py-4" },
                    React.createElement("p", { className: "text-protein mb-3" }, error),
                    React.createElement("button", { onClick: () => { triggerHapticFeedback(); onGenerate(); }, className: "bg-primary text-white font-semibold py-2 px-4 rounded-lg text-sm transition-transform active:scale-95" },
                        "Try Again"
                    )
                )
            ) : (
                React.createElement(React.Fragment, null,
                    displaySuggestions && displaySuggestions.length > 0 ? (
                        React.createElement("ul", { className: "space-y-3" },
                            displaySuggestions.map((s, i) => (
                                React.createElement("li", { key: i, className: "flex items-start" },
                                    React.createElement("span", { className: "text-primary mr-3 mt-1" }, "✓"),
                                    React.createElement("p", { className: "text-text-main dark:text-dark-text-main text-sm" }, s)
                                )
                            ))
                        )
                    ) : (
                        React.createElement("div", { className: "text-center py-4" },
                            React.createElement("p", { className: "text-text-light dark:text-dark-text-light mb-4" }, "Get personalized tips based on your weekly progress.")
                        )
                    ),
                    React.createElement("div", { className: "text-center mt-6" },
                        React.createElement("button", { onClick: () => { triggerHapticFeedback(); onGenerate(); }, className: "bg-primary text-white font-semibold py-2 px-4 rounded-lg transition-transform active:scale-95" },
                            hasGenerated ? 'Re-generate Insights' : 'Generate Insights'
                        )
                    )
                )
            )
        )
    );
};

const initialAiSuggestions = [
    "You're doing great with your calorie goals! Keep up the consistent effort.",
    "Consider adding a bit more protein to your breakfast, like Greek yogurt or eggs, to feel fuller longer.",
    "Try incorporating a short 15-minute walk after dinner; it can help with digestion and boost your daily activity."
];

const ProgressScreen = () => {
    const { 
        loggedMeals, 
        theme,
        loggedActivities,
        weightHistory,
        goalWeight,
        currentWeight,
        profile,
        macroGoals,
        showToast,
        triggerHapticFeedback,
    } = useAppContext();
    
    const [timeframe, setTimeframe] = useState('weekly');
    const [view, setView] = useState('Nutrition');
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestionError, setSuggestionError] = useState(null);
    const [hasGeneratedInsights, setHasGeneratedInsights] = useState(false);
    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const handleRefresh = async () => {
        setIsLoadingPage(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        setIsLoadingPage(false);
        setHasGeneratedInsights(false);
        setAiSuggestions(null);
        showToast({ text: "Progress refreshed!", type: 'info' });
    };
    const { isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd, scrollRef } = usePullToRefresh(handleRefresh);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoadingPage(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    
    const isDarkMode = theme === 'dark';
    const axisColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const tooltipStyle = {
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '0.5rem',
      border: `1px solid ${isDarkMode ? '#334151' : '#e5e7eb'}`,
      color: isDarkMode ? '#F8FAFC' : '#1E293B'
    };

    const handleGenerateSuggestion = async () => {
        setIsGenerating(true);
        setSuggestionError(null);
        setAiSuggestions(null);
        setHasGeneratedInsights(true);

        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            const startDateString = toYYYYMMDD(startDate);

            const recentMeals = loggedMeals.filter(m => m.date >= startDateString);
            const daysWithMeals = new Set(recentMeals.map(m => m.date)).size || 1;
            const totalNutrition = recentMeals.reduce((acc, meal) => {
                acc.calories += meal.calories;
                acc.protein += meal.protein;
                acc.carbs += meal.carbs;
                acc.fats += meal.fats;
                return acc;
            }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

            const avgNutrition = {
                calories: totalNutrition.calories / daysWithMeals,
                protein: totalNutrition.protein / daysWithMeals,
                carbs: totalNutrition.carbs / daysWithMeals,
                fats: totalNutrition.fats / daysWithMeals,
            };
            
            const recentActivities = loggedActivities.filter(a => a.date >= startDateString);
            const daysWithActivity = new Set(recentActivities.map(a => a.date)).size || 1;
            const totalCaloriesBurned = recentActivities.reduce((sum, act) => sum + act.caloriesBurned, 0);
            const avgCaloriesBurned = totalCaloriesBurned / daysWithActivity;
            
            const calorieGoal = (macroGoals.protein * 4) + (macroGoals.carbs * 4) + (macroGoals.fats * 9);

            const suggestions = await getAIPersonalizedSuggestion({
                profile,
                macroGoals,
                calorieGoal,
                avgNutrition,
                avgCaloriesBurned,
            });
            setAiSuggestions(suggestions);
        } catch (err) {
            setSuggestionError('Sorry, I couldn\'t generate insights right now.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const nutritionData = useMemo(() => {
        if (isLoadingPage) return { chartData: [], macroPieData: [] };
        const endDate = new Date();
        const numDays = timeframe === 'weekly' ? 7 : 30;
        
        const dateArray = Array.from({ length: numDays }, (_, i) => {
            const date = new Date();
            date.setDate(endDate.getDate() - i);
            return date;
        }).reverse();

        const chartData = dateArray.map(date => {
            const dateString = toYYYYMMDD(date);
            const mealsForDay = loggedMeals.filter(m => m.date === dateString);
            const dailySummary = mealsForDay.reduce((acc, meal) => {
                acc.calories += meal.calories;
                acc.protein += meal.protein;
                acc.carbs += meal.carbs;
                acc.fats += meal.fats;
                return acc;
            }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

            return {
                name: formatDate(date, { month: 'short', day: 'numeric' }),
                ...dailySummary
            };
        });

        const totalMacros = chartData.reduce((acc, day) => {
             acc.protein += day.protein;
             acc.carbs += day.carbs;
             acc.fats += day.fats;
             return acc;
        }, { protein: 0, carbs: 0, fats: 0 });

        const macroPieData = [
            { name: 'Protein', value: totalMacros.protein },
            { name: 'Carbs', value: totalMacros.carbs },
            { name: 'Fats', value: totalMacros.fats },
        ].filter(d => d.value > 0);

        return { chartData, macroPieData };
    }, [loggedMeals, timeframe, isLoadingPage]);

    const activityData = useMemo(() => {
        if (isLoadingPage) return { chartData: [], totalCaloriesBurned: 0 };
        const endDate = new Date();
        const numDays = timeframe === 'weekly' ? 7 : 30;
        
        const dateArray = Array.from({ length: numDays }, (_, i) => {
            const date = new Date();
            date.setDate(endDate.getDate() - i);
            return date;
        }).reverse();

        const chartData = dateArray.map(date => {
            const dateString = toYYYYMMDD(date);
            const activitiesForDay = loggedActivities.filter(a => a.date === dateString);
            const caloriesBurned = activitiesForDay.reduce((sum, act) => sum + act.caloriesBurned, 0);
            return {
                name: formatDate(date, { month: 'short', day: 'numeric' }),
                caloriesBurned,
            };
        });

        const totalCaloriesBurned = chartData.reduce((sum, day) => sum + day.caloriesBurned, 0);

        return { chartData, totalCaloriesBurned };
    }, [loggedActivities, timeframe, isLoadingPage]);

    const weightData = useMemo(() => {
        if (isLoadingPage) return { bmi: '0.0', bmiCategory: 'N/A', chartData: [], yMin: 0, yMax: 100 };
        const bmi = (currentWeight / (profile.height * profile.height)) * 703;
        const bmiCategory = (() => {
            if (bmi < 18.5) return 'Underweight';
            if (bmi < 25) return 'Healthy';
            if (bmi < 30) return 'Overweight';
            return 'Obese';
        })();

        const chartData = weightHistory.map(entry => ({
            date: formatDate(new Date(entry.date), { month: 'short', day: 'numeric' }),
            weight: getDisplayWeight(entry.weight, profile.unitSystem),
            goal: getDisplayWeight(goalWeight, profile.unitSystem)
        }));

        const allWeights = chartData.flatMap(d => [d.weight, d.goal]);
        const calculatedYMin = allWeights.length > 0 ? Math.min(...allWeights) - 5 : 0;
        const calculatedYMax = allWeights.length > 0 ? Math.max(...allWeights) + 5 : 100;

        return {
            bmi: bmi.toFixed(1),
            bmiCategory,
            chartData,
            yMin: calculatedYMin,
            yMax: calculatedYMax,
        };
    }, [weightHistory, currentWeight, goalWeight, profile, isLoadingPage]);
    
    const handleSetView = (newView) => {
        triggerHapticFeedback();
        setView(newView);
    };

    const handleSetTimeframe = (newTimeframe) => {
        triggerHapticFeedback();
        setTimeframe(newTimeframe);
    };

    const renderNutritionView = () => (
        React.createElement(React.Fragment, null,
            React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm" },
                React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-4 font-montserrat" }, "Calorie Intake"),
                React.createElement("div", { style: { width: '100%', height: 250 } },
                    React.createElement(ResponsiveContainer, null,
                        React.createElement(BarChart, { data: nutritionData.chartData, margin: { top: 5, right: 10, left: -20, bottom: 5 } },
                            React.createElement(XAxis, { dataKey: "name", fontSize: 12, tickLine: false, axisLine: false, stroke: axisColor }),
                            React.createElement(YAxis, { fontSize: 12, tickLine: false, axisLine: false, stroke: axisColor }),
                            React.createElement(Tooltip, { contentStyle: tooltipStyle, cursor: { fill: isDarkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(229, 231, 235, 0.4)'} }),
                            React.createElement(Bar, { dataKey: "calories", fill: "#00C795", radius: [4, 4, 0, 0] })
                        )
                    )
                )
            ),
            React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm" },
                React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-4 font-montserrat" }, "Macronutrient Distribution"),
                nutritionData.macroPieData.length > 0 ? (
                    React.createElement("div", { style: { width: '100%', height: 250 }, className: "flex justify-center items-center text-text-main dark:text-dark-text-main" },
                        React.createElement(ResponsiveContainer, null,
                            React.createElement(PieChart, null,
                                React.createElement(Pie, {
                                    data: nutritionData.macroPieData, cx: "50%", cy: "50%",
                                    labelLine: false, outerRadius: 80, fill: "#8884d8", dataKey: "value",
                                    label: ({ name, percent }) => `${(percent * 100).toFixed(0)}%`,
                                    fontSize: 12
                                },
                                    nutritionData.macroPieData.map((entry, index) => (
                                        React.createElement(Cell, { key: `cell-${index}`, fill: ['#EF4444', '#FBBF24', '#3B82F6'][index] })
                                    ))
                                ),
                                React.createElement(Legend, { formatter: (value) => React.createElement("span", { className: "text-text-main dark:text-dark-text-main" }, value) }),
                                React.createElement(Tooltip, { contentStyle: tooltipStyle })
                            )
                        )
                    )
                ) : (
                    React.createElement("div", { className: "text-center py-8 text-medium-gray dark:text-dark-gray" },
                        React.createElement(BarChartIcon, { className: "w-16 h-16 mx-auto text-medium-gray dark:text-dark-gray mb-4" }),
                        React.createElement("p", { className: "font-semibold text-text-main dark:text-dark-text-main mb-1" }, "No Macro Data Yet"),
                        React.createElement("p", { className: "text-sm text-text-light dark:text-dark-text-light mt-1" }, "Log a few meals to see your insights here!")
                    )
                )
            )
        )
    );
    
    const renderActivityView = () => (
        React.createElement(React.Fragment, null,
             React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm" },
                React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-4 font-montserrat" }, "Calories Burned"),
                React.createElement("p", { className: "text-3xl font-bold text-secondary" }, activityData.totalCaloriesBurned, " ", React.createElement("span", { className: "text-xl font-medium text-text-light dark:text-dark-text-light" }, "kcal")),
                React.createElement("div", { style: { width: '100%', height: 250 } },
                    React.createElement(ResponsiveContainer, null,
                        React.createElement(BarChart, { data: activityData.chartData, margin: { top: 20, right: 10, left: -20, bottom: 5 } },
                            React.createElement(XAxis, { dataKey: "name", fontSize: 12, tickLine: false, axisLine: false, stroke: axisColor }),
                            React.createElement(YAxis, { fontSize: 12, tickLine: false, axisLine: false, stroke: axisColor }),
                            React.createElement(Tooltip, { contentStyle: tooltipStyle, cursor: { fill: isDarkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(229, 231, 235, 0.4)'} }),
                            React.createElement(Bar, { dataKey: "caloriesBurned", fill: "#F97316", radius: [4, 4, 0, 0] })
                        )
                    )
                )
            )
        )
    );

    const renderWeightView = () => (
        React.createElement(React.Fragment, null,
            React.createElement("div", { className: "flex gap-4" },
                React.createElement(StatCard, { label: "Current Weight", value: formatWeight(currentWeight, profile.unitSystem) }),
                React.createElement(StatCard, { label: "BMI" },
                    React.createElement("div", { className: "flex items-baseline gap-2" },
                        React.createElement("p", { className: "text-2xl font-bold text-text-main dark:text-dark-text-main" }, weightData.bmi),
                        React.createElement(BmiIndicator, { category: weightData.bmiCategory })
                    )
                )
            ),
            React.createElement("div", { className: "bg-card dark:bg-dark-card p-4 rounded-2xl" },
                React.createElement("h2", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main mb-2 font-montserrat" }, "Weight Progress"),
                React.createElement("div", { style: { width: '100%', height: 250 } },
                weightData.chartData.length > 1 ? (
                    React.createElement(ResponsiveContainer, null,
                        React.createElement(LineChart, { data: weightData.chartData, margin: { top: 20, right: 10, left: -20, bottom: 0 } },
                            React.createElement(XAxis, { dataKey: "date", fontSize: 12, tickLine: false, axisLine: false, stroke: axisColor }),
                            React.createElement(YAxis, { domain: [weightData.yMin, weightData.yMax], fontSize: 12, tickLine: false, axisLine: false, stroke: axisColor, unit: profile.unitSystem === 'metric' ? ' kg' : ' lbs' }),
                            React.createElement(Tooltip, { contentStyle: tooltipStyle }),
                            React.createElement(Line, { type: "monotone", dataKey: "weight", name: "Weight", stroke: "#00C795", strokeWidth: 2 }),
                            React.createElement(Line, { type: "monotone", dataKey: "goal", name: "Goal", stroke: "#F97316", strokeDasharray: "5 5" })
                        )
                    )
                ) : (
                    React.createElement("div", { className: "flex items-center justify-center h-full text-text-light dark:text-dark-text-light" },
                        React.createElement("p", null, "Log your weight for a few days to see a chart.")
                    )
                )
                )
            )
        )
    );

    return (
        React.createElement("div", { 
            className: "p-4 bg-background dark:bg-dark-background min-h-full flex flex-col",
            ref: scrollRef,
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd
        },
            isRefreshing && React.createElement(PullToRefreshIndicator, null),
            React.createElement("h1", { className: "text-3xl font-bold text-text-main dark:text-dark-text-main mb-6 text-center font-montserrat" }, "Progress"),
            
            isLoadingPage ? (
                React.createElement(ProgressSkeleton, null)
            ) : (
                React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "flex p-1 bg-light-gray dark:bg-dark-border rounded-full mb-6" },
                        React.createElement("button", { onClick: () => handleSetView('Nutrition'), className: `w-full py-2 rounded-full text-sm font-semibold transition-colors transition-transform active:scale-95 ${view === 'Nutrition' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}` }, "Nutrition"),
                        React.createElement("button", { onClick: () => handleSetView('Activity'), className: `w-full py-2 rounded-full text-sm font-semibold transition-colors transition-transform active:scale-95 ${view === 'Activity' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}` }, "Activity"),
                        React.createElement("button", { onClick: () => handleSetView('Weight'), className: `w-full py-2 rounded-full text-sm font-semibold transition-colors transition-transform active:scale-95 ${view === 'Weight' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}` }, "Weight")
                    ),
                    
                    (view === 'Nutrition' || view === 'Activity') && (
                        React.createElement("div", { className: "flex justify-center p-1 bg-light-gray dark:bg-dark-border rounded-full mb-6" },
                            React.createElement("button", { onClick: () => handleSetTimeframe('weekly'), className: `w-full py-2 rounded-full text-sm font-semibold transition-colors transition-transform active:scale-95 ${timeframe === 'weekly' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}` }, "Weekly"),
                            React.createElement("button", { onClick: () => handleSetTimeframe('monthly'), className: `w-full py-2 rounded-full text-sm font-semibold transition-colors transition-transform active:scale-95 ${timeframe === 'monthly' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}` }, "Monthly")
                        )
                    ),
                    
                    React.createElement("div", { className: "space-y-6 animate-fade-in flex-1 overflow-y-auto" },
                        React.createElement(AISuggestionCard, { 
                            suggestions: aiSuggestions,
                            isLoading: isGenerating,
                            error: suggestionError,
                            onGenerate: handleGenerateSuggestion,
                            initialSuggestions: initialAiSuggestions,
                            hasGenerated: hasGeneratedInsights
                        }),
                        
                        view === 'Nutrition' && renderNutritionView(),
                        view === 'Activity' && renderActivityView(),
                        view === 'Weight' && renderWeightView()
                    )
                )
            )
        )
    );
};

export default ProgressScreen;
