

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Page, MealType } from '../types.js';
import { BellIcon, ChevronLeftIcon, ChevronRightIcon, ChefHatIcon, CalendarIcon, SunIcon, CloudRainIcon, CloudSnowIcon } from '../components/Icons.js';
import { toYYYYMMDD, formatDate, isToday, isYesterday } from '../utils/dateUtils.js';
import { useAppContext } from '../contexts/AppContext.js';
import ConcentricProgress from '../components/ConcentricProgress.js';
import WaterIntakePod from '../components/WaterIntakePod.js';
import DateSelector from '../components/DateSelector.js';
import DailySummaryCard from '../components/DailySummaryCard.js';
import StreakCounter from '../components/StreakCounter.js';
import CalendarModal from '../components/CalendarModal.js';
import ConfettiOverlay from '../components/ConfettiOverlay.js';
import WeatherOverlay from '../components/WeatherOverlay.js';
import { usePullToRefresh } from '../hooks/usePullToRefresh.js';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator.js';
import DashboardSkeleton from '../components/DashboardSkeleton.js';

const mealIcons = {
    [MealType.Breakfast]: '🥞',
    [MealType.Lunch]: '🥗',
    [MealType.Dinner]: '🍲',
    [MealType.Snacks]: '🍎',
};

const MealSummaryCard = ({ mealType, meals, onMealClick }) => {
    const { triggerHapticFeedback } = useAppContext();
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    if (meals.length === 0) return null;

    return (
        React.createElement("div", { className: "bg-card dark:bg-dark-card p-4 rounded-xl shadow-sm dark:border dark:border-dark-border" },
            React.createElement("div", { className: "flex justify-between items-center mb-3" },
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("span", { className: "text-2xl mr-3" }, mealIcons[mealType]),
                    React.createElement("h3", { className: "text-lg font-semibold text-text-main dark:text-dark-text-main font-montserrat" }, mealType)
                ),
                React.createElement("span", { className: "font-semibold text-text-main dark:text-dark-text-main" }, totalCalories + " cal")
            ),
            React.createElement("div", { className: "space-y-2" },
                meals.map((meal) => (
                    React.createElement("button", {
                        key: meal.originalIndex,
                        onClick: () => { triggerHapticFeedback(); onMealClick(meal.originalIndex); },
                        className: "flex justify-between text-sm w-full text-left p-1 -m-1 rounded hover:bg-light-gray dark:hover:bg-dark-border transition-transform active:scale-95"
                    },
                        React.createElement("p", { className: "text-text-light dark:text-dark-text-light" }, meal.name),
                        React.createElement("p", { className: "text-text-main dark:text-dark-text-main font-medium" }, meal.calories + " cal")
                    )
                ))
            )
        )
    );
};


const DashboardScreen = () => {
    const {
      navigateTo,
      loggedMeals,
      loggedActivities,
      profile,
      macroGoals,
      waterIntakeHistory,
      waterGoal,
      handleWaterIntakeUpdate,
      viewMealDetail,
      dayStreak,
      showToast,
      triggerHapticFeedback,
    } = useAppContext();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [timeOfDay, setTimeOfDay] = useState('morning');
    const [showAchievement, setShowAchievement] = useState(false);
    const [weatherCondition, setWeatherCondition] = useState('sunny');
    const [isLoadingData, setIsLoadingData] = useState(true);

    const handleRefresh = async () => {
        setIsLoadingData(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        setSelectedDate(new Date());
        setIsLoadingData(false);
        showToast({ text: "Dashboard refreshed!", type: 'info' });
    };
    const { isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd, scrollRef } = usePullToRefresh(handleRefresh);

    const dateString = toYYYYMMDD(selectedDate);
    const waterIntake = waterIntakeHistory[dateString] || 0;

    const { mealsForDay, summary, caloriesBurned } = useMemo(() => {
        if (isLoadingData) return { mealsForDay: [], summary: { calories: 0, protein: 0, carbs: 0, fats: 0 }, caloriesBurned: 0 };
        const meals = loggedMeals.map((meal, originalIndex) => ({ ...meal, originalIndex })).filter(meal => meal.date === dateString);
        const summary = meals.reduce((acc, meal) => {
            acc.calories += meal.calories;
            acc.protein += meal.protein;
            acc.carbs += meal.carbs;
            acc.fats += meal.fats;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
        const activitiesForDay = loggedActivities.filter(activity => activity.date === dateString);
        const caloriesBurned = activitiesForDay.reduce((sum, activity) => sum + activity.caloriesBurned, 0);
        return { mealsForDay: meals, summary, caloriesBurned };
    }, [selectedDate, loggedMeals, loggedActivities, isLoadingData]);
    
    const calorieGoal = useMemo(() => (macroGoals.protein * 4) + (macroGoals.carbs * 4) + (macroGoals.fats * 9), [macroGoals]);

    const mealsByType = useMemo(() => {
      return mealsForDay.reduce((acc, meal) => {
        (acc[meal.type] = acc[meal.type] || []).push(meal);
        return acc;
      }, {});
    }, [mealsForDay]);

    const dateSubtext = useMemo(() => {
        if (isToday(selectedDate)) return `Today, ${formatDate(selectedDate, { month: 'long', day: 'numeric' })}`;
        if (isYesterday(selectedDate)) return `Yesterday, ${formatDate(selectedDate, { month: 'long', day: 'numeric' })}`;
        return formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' });
    }, [selectedDate]);
    
    const changeDay = (offset) => {
        triggerHapticFeedback();
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + offset);
            return newDate;
        });
    };

    const handleOpenCalendar = () => {
        triggerHapticFeedback();
        setIsCalendarModalOpen(true);
    };

    const handleCalendarDateSelect = (date) => {
        triggerHapticFeedback();
        setSelectedDate(date);
        setIsCalendarModalOpen(false);
    };

    useEffect(() => {
        const updateTimeOfDay = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 11) setTimeOfDay('morning');
            else if (hour >= 11 && hour < 17) setTimeOfDay('afternoon');
            else setTimeOfDay('evening');
        };
        updateTimeOfDay();
        const intervalId = setInterval(updateTimeOfDay, 3600000);
        return () => clearInterval(intervalId);
    }, []);

    const headerGradientClass = useMemo(() => {
        switch (timeOfDay) {
            case 'morning': return 'from-morning-start to-morning-end';
            case 'afternoon': return 'from-afternoon-start to-afternoon-end';
            case 'evening': return 'from-evening-start to-evening-end';
            default: return 'from-primary to-primary-light';
        }
    }, [timeOfDay]);

    const lastIsGoalMet = useRef(false);
    useEffect(() => {
        if (selectedDate && isToday(selectedDate)) {
            const calorieThreshold = 50;
            const macroThreshold = 5;
            const isCalorieGoalMet = Math.abs(summary.calories - calorieGoal) <= calorieThreshold;
            const isProteinGoalMet = Math.abs(summary.protein - macroGoals.protein) <= macroThreshold;
            const isCarbsGoalMet = Math.abs(summary.carbs - macroGoals.carbs) <= macroThreshold;
            const isFatsGoalMet = Math.abs(summary.fats - macroGoals.fats) <= macroThreshold;
            const currentIsGoalMet = isCalorieGoalMet && isProteinGoalMet && isCarbsGoalMet && isFatsGoalMet;
            if (currentIsGoalMet && !lastIsGoalMet.current) {
                setShowAchievement(true);
                triggerHapticFeedback();
                setTimeout(() => setShowAchievement(false), 5000);
            }
            lastIsGoalMet.current = currentIsGoalMet;
        } else {
            setShowAchievement(false);
            lastIsGoalMet.current = false;
        }
    }, [selectedDate, summary, calorieGoal, macroGoals, triggerHapticFeedback]);

    const toggleWeatherCondition = () => {
        triggerHapticFeedback();
        setWeatherCondition(prev => {
            switch (prev) {
                case 'sunny': return 'rainy';
                case 'rainy': return 'snowy';
                case 'snowy': return 'sunny';
            }
        });
    };

    const renderWeatherIcon = () => {
        switch (weatherCondition) {
            case 'sunny': return React.createElement(SunIcon, { className: "w-5 h-5 text-yellow-400" });
            case 'rainy': return React.createElement(CloudRainIcon, { className: "w-5 h-5 text-blue-400" });
            case 'snowy': return React.createElement(CloudSnowIcon, { className: "w-5 h-5 text-blue-200" });
            default: return null;
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoadingData(false), 1000);
        return () => clearTimeout(timer);
    }, []);

  return (
    React.createElement("div", { 
        className: "bg-background dark:bg-dark-background min-h-full overflow-x-hidden relative flex flex-col",
        ref: scrollRef,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd
    },
        isRefreshing && React.createElement(PullToRefreshIndicator, null),
        showAchievement && React.createElement(ConfettiOverlay, null),
        React.createElement(WeatherOverlay, { weatherCondition: weatherCondition }),
        isLoadingData ? (
            React.createElement(DashboardSkeleton, null)
        ) : (
            React.createElement(React.Fragment, null,
                React.createElement("header", { className: `p-4 pb-8 flex justify-between items-start bg-gradient-to-br ${headerGradientClass} text-white dark:text-dark-text-main relative z-10 rounded-b-3xl shadow-lg` },
                    React.createElement("div", null,
                        React.createElement("h1", { className: "text-2xl font-bold font-montserrat drop-shadow-sm" }, "Hello, " + profile.name + "!"),
                        React.createElement("p", { className: "text-white/90 drop-shadow-sm" }, dateSubtext)
                    ),
                    React.createElement("div", { className: "flex items-center space-x-2" },
                        React.createElement("button", { onClick: toggleWeatherCondition, className: "relative p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors transition-transform active:scale-95" }, renderWeatherIcon()),
                        React.createElement(StreakCounter, { streak: dayStreak }),
                        React.createElement("button", { onClick: () => { triggerHapticFeedback(); navigateTo(Page.Settings); }, className: "relative p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors transition-transform active:scale-95" },
                            React.createElement(BellIcon, { className: "w-6 h-6 text-white" })
                        )
                    )
                ),
                React.createElement("div", { className: "p-4 -mt-12 relative z-20" },
                    React.createElement("div", { className: "flex justify-between items-center mb-4" },
                        React.createElement("button", { onClick: () => changeDay(-1), className: "p-2 rounded-full bg-card dark:bg-dark-card hover:bg-light-gray dark:hover:bg-dark-border shadow-sm transition-transform active:scale-95", "aria-label": "Previous day" },
                            React.createElement(ChevronLeftIcon, { className: "w-5 h-5 text-text-main dark:text-dark-text-main" })
                        ),
                        React.createElement("h3", { className: "font-bold text-lg text-text-main dark:text-dark-text-main font-montserrat", "aria-live": "polite" }, formatDate(selectedDate, { month: 'long', year: 'numeric' })),
                        React.createElement("button", { onClick: () => changeDay(1), className: "p-2 rounded-full bg-card dark:bg-dark-card hover:bg-light-gray dark:hover:bg-dark-border shadow-sm transition-transform active:scale-95", "aria-label": "Next day" },
                            React.createElement(ChevronRightIcon, { className: "w-5 h-5 text-text-main dark:text-dark-text-main" })
                        )
                    ),
                    React.createElement(DateSelector, { selectedDate: selectedDate, onDateChange: setSelectedDate, onDayClick: handleOpenCalendar })
                ),
                React.createElement("div", null,
                    React.createElement("div", { className: "p-4 space-y-6" },
                        React.createElement(DailySummaryCard, { caloriesIn: summary.calories, caloriesOut: caloriesBurned, calorieGoal: calorieGoal }),
                        React.createElement(ConcentricProgress, { summary: summary, calorieGoal: calorieGoal, macroGoals: macroGoals, caloriesBurned: caloriesBurned }),
                        React.createElement(WaterIntakePod, { currentIntake: waterIntake, goal: waterGoal, onAddWater: (amount) => handleWaterIntakeUpdate(dateString, waterIntake + amount), onRemoveWater: (amount) => handleWaterIntakeUpdate(dateString, Math.max(0, waterIntake - amount)), onResetWater: () => handleWaterIntakeUpdate(dateString, 0), showToast: showToast }),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("h2", { className: "text-xl font-bold text-text-main dark:text-dark-text-main font-montserrat" }, "Logged Meals"),
                            mealsForDay.length > 0 ? (
                                React.createElement("div", { className: "space-y-4" },
                                    React.createElement(MealSummaryCard, { mealType: MealType.Breakfast, meals: mealsByType[MealType.Breakfast] || [], onMealClick: viewMealDetail }),
                                    React.createElement(MealSummaryCard, { mealType: MealType.Lunch, meals: mealsByType[MealType.Lunch] || [], onMealClick: viewMealDetail }),
                                    React.createElement(MealSummaryCard, { mealType: MealType.Dinner, meals: mealsByType[MealType.Dinner] || [], onMealClick: viewMealDetail }),
                                    React.createElement(MealSummaryCard, { mealType: MealType.Snacks, meals: mealsByType[MealType.Snacks] || [], onMealClick: viewMealDetail })
                                )
                            ) : (
                                React.createElement("div", { className: "text-center py-8 px-4 bg-card dark:bg-dark-card rounded-2xl shadow-sm" },
                                    React.createElement(ChefHatIcon, { className: "w-12 h-12 mx-auto text-medium-gray dark:text-dark-gray mb-4" }),
                                    React.createElement("p", { className: "font-bold text-lg text-text-main dark:text-dark-text-main mb-1" }, "Your day is a blank canvas!"),
                                    React.createElement("p", { className: "text-sm text-text-light dark:text-dark-text-light mt-2" }, "Tap the plus button to log your first meal and see your progress come to life.")
                                )
                            )
                        )
                    )
                ),
                React.createElement(CalendarModal, { isOpen: isCalendarModalOpen, onClose: () => setIsCalendarModalOpen(false), selectedDate: selectedDate, onSelectDate: handleCalendarDateSelect })
            )
        )
    )
  );
};

export default DashboardScreen;
