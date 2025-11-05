


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Page, MealType, Meal, FoodSearchResult } from '../types.js';
import { BellIcon, ChevronLeftIcon, ChevronRightIcon, ChefHatIcon, CalendarIcon, CheckCircleIcon, SunIcon, CloudRainIcon, CloudSnowIcon } from '../components/Icons.js'; // Added CheckCircleIcon, SunIcon, CloudRainIcon, CloudSnowIcon
import { toYYYYMMDD, formatDate, isToday, isYesterday } from '../utils/dateUtils.js';
import { useAppContext } from '../contexts/AppContext.js';
import ConcentricProgress from '../components/ConcentricProgress.js';
import WaterIntakePod from '../components/WaterIntakePod.js';
import DateSelector from '../components/DateSelector.js';
import DailySummaryCard from '../components/DailySummaryCard.js';
import StreakCounter from '../components/StreakCounter.js';
import CalendarModal from '../components/CalendarModal.js';
import ConfettiOverlay from '../components/ConfettiOverlay.js'; // Import new ConfettiOverlay
import WeatherOverlay from '../components/WeatherOverlay.js'; // Import new WeatherOverlay
import { usePullToRefresh } from '../hooks/usePullToRefresh.js'; 
import PullToRefreshIndicator from '../components/PullToRefreshIndicator.js'; // Updated to relative import
import DashboardSkeleton from '../components/DashboardSkeleton.js'; // Updated to relative import

const mealIcons: Record<MealType, string> = {
    [MealType.Breakfast]: '🥞',
    [MealType.Lunch]: '🥗',
    [MealType.Dinner]: '🍲',
    [MealType.Snacks]: '🍎',
};

const MealSummaryCard: React.FC<{
  mealType: MealType;
  meals: (Meal & { originalIndex: number })[];
  onMealClick: (index: number) => void;
}> = ({ mealType, meals, onMealClick }) => {
    const { triggerHapticFeedback } = useAppContext();
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    if (meals.length === 0) return null;

    return (
        <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-sm dark:border dark:border-dark-border">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">{mealIcons[mealType]}</span>
                    <h3 className="text-lg font-semibold text-text-main dark:text-dark-text-main font-montserrat">{mealType}</h3>
                </div>
                <span className="font-semibold text-text-main dark:text-dark-text-main">{totalCalories} cal</span>
            </div>
            <div className="space-y-2">
                {meals.map((meal) => (
                    <button
                        key={meal.originalIndex}
                        onClick={() => { triggerHapticFeedback(); onMealClick(meal.originalIndex); }}
                        className="flex justify-between text-sm w-full text-left p-1 -m-1 rounded hover:bg-light-gray dark:hover:bg-dark-border transition-transform active:scale-95"
                    >
                        <p className="text-text-light dark:text-dark-text-light">{meal.name}</p>
                        <p className="text-text-main dark:text-dark-text-main font-medium">{meal.calories} cal</p>
                    </button>
                ))}
            </div>
        </div>
    );
};


const DashboardScreen: React.FC = () => {
    const {
      navigateTo,
      loggedMeals,
      loggedActivities,
      profile,
      macroGoals,
      waterIntakeHistory,
      waterGoal,
      handleWaterIntakeUpdate,
      // Removed handleMealLogged from here as quick add is removed.
      viewMealDetail,
      dayStreak,
      showToast,
      triggerHapticFeedback, // Added triggerHapticFeedback
    } = useAppContext();

    const [selectedDate, setSelectedDate] = useState(new Date());
    // Removed isFabMenuOpen, isQuickAddMenuOpen states
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false); // New state for calendar modal
    const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning'); // New state for time of day
    const [showAchievement, setShowAchievement] = useState(false); // New state for achievement
    const [weatherCondition, setWeatherCondition] = useState<'sunny' | 'rainy' | 'snowy'>('sunny'); // New state for simulated weather
    const [isLoadingData, setIsLoadingData] = useState(true); // New state for skeleton loading

    // Pull-to-refresh hook
    const handleRefresh = async () => {
        setIsLoadingData(true);
        // Simulate a network request or data refetch
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        setSelectedDate(new Date()); // Reset date to today or refetch current day's data
        setIsLoadingData(false);
        showToast({ text: "Dashboard refreshed!", type: 'info' });
    };
    const { isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd, scrollRef } = usePullToRefresh(handleRefresh);


    const dateString = toYYYYMMDD(selectedDate);
    const waterIntake = waterIntakeHistory[dateString] || 0;

    const { mealsForDay, summary, caloriesBurned } = useMemo(() => {
        if (isLoadingData) return { mealsForDay: [], summary: { calories: 0, protein: 0, carbs: 0, fats: 0 }, caloriesBurned: 0 };

        const meals = loggedMeals
            .map((meal, originalIndex) => ({ ...meal, originalIndex }))
            .filter(meal => meal.date === dateString);
        
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
      }, {} as Record<MealType, (Meal & { originalIndex: number })[]>);
    }, [mealsForDay]);

    const dateSubtext = useMemo(() => {
        if (isToday(selectedDate)) {
            return `Today, ${formatDate(selectedDate, { month: 'long', day: 'numeric' })}`;
        }
        if (isYesterday(selectedDate)) {
            return `Yesterday, ${formatDate(selectedDate, { month: 'long', day: 'numeric' })}`;
        }
        return formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' });
    }, [selectedDate]);
    
    const changeDay = (offset: number) => {
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

    const handleCalendarDateSelect = (date: Date) => {
        triggerHapticFeedback();
        setSelectedDate(date);
        setIsCalendarModalOpen(false);
    };

    // Determine time of day for header background
    useEffect(() => {
        const updateTimeOfDay = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 11) {
                setTimeOfDay('morning');
            } else if (hour >= 11 && hour < 17) {
                setTimeOfDay('afternoon');
            } else {
                setTimeOfDay('evening');
            }
        };
        updateTimeOfDay(); // Set initially
        const intervalId = setInterval(updateTimeOfDay, 3600000); // Update every hour
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

    // Achievement Unlocked Logic
    const lastIsGoalMet = useRef(false);
    useEffect(() => {
        if (selectedDate && isToday(selectedDate)) { // Only check for today
            const calorieThreshold = 50; // calories
            const macroThreshold = 5; // grams

            const isCalorieGoalMet = Math.abs(summary.calories - calorieGoal) <= calorieThreshold;
            const isProteinGoalMet = Math.abs(summary.protein - macroGoals.protein) <= macroThreshold;
            const isCarbsGoalMet = Math.abs(summary.carbs - macroGoals.carbs) <= macroThreshold;
            const isFatsGoalMet = Math.abs(summary.fats - macroGoals.fats) <= macroThreshold;
            
            const currentIsGoalMet = isCalorieGoalMet && isProteinGoalMet && isCarbsGoalMet && isFatsGoalMet;

            if (currentIsGoalMet && !lastIsGoalMet.current) {
                setShowAchievement(true);
                triggerHapticFeedback();
                setTimeout(() => setShowAchievement(false), 5000); // Hide after 5 seconds
            }
            lastIsGoalMet.current = currentIsGoalMet;
        } else {
            setShowAchievement(false); // Hide if not today
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
            case 'sunny': return <SunIcon className="w-5 h-5 text-yellow-400" />;
            case 'rainy': return <CloudRainIcon className="w-5 h-5 text-blue-400" />;
            case 'snowy': return <CloudSnowIcon className="w-5 h-5 text-blue-200" />;
            default: return null;
        }
    };

    // Simulate initial loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoadingData(false);
        }, 1000); // Simulate 1 second loading
        return () => clearTimeout(timer);
    }, []);

  return (
    <div 
        className="bg-background dark:bg-dark-background min-h-full overflow-x-hidden relative flex flex-col"
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
        {isRefreshing && <PullToRefreshIndicator />}
        {showAchievement && <ConfettiOverlay />}
        <WeatherOverlay weatherCondition={weatherCondition} />

        {isLoadingData ? (
            <DashboardSkeleton />
        ) : (
            <>
                {/* Dynamic Header */}
                <header className={`p-4 pb-8 flex justify-between items-start bg-gradient-to-br ${headerGradientClass} text-white dark:text-dark-text-main relative z-10 rounded-b-3xl shadow-lg`}>
                    <div>
                        <h1 className="text-2xl font-bold font-montserrat drop-shadow-sm">Hello, {profile.name}!</h1>
                        <p className="text-white/90 drop-shadow-sm">{dateSubtext}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={toggleWeatherCondition} className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors transition-transform active:scale-95">
                            {renderWeatherIcon()}
                        </button>
                        <StreakCounter streak={dayStreak} />
                        <button onClick={() => { triggerHapticFeedback(); navigateTo(Page.Settings); }} className="relative p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors transition-transform active:scale-95">
                            <BellIcon className="w-6 h-6 text-white" />
                            {/* <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-current"></span> */}
                        </button>
                    </div>
                </header>
            
                <div className="p-4 -mt-12 relative z-20"> {/* Lift content over the header bottom curve */}
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeDay(-1)} className="p-2 rounded-full bg-card dark:bg-dark-card hover:bg-light-gray dark:hover:bg-dark-border shadow-sm transition-transform active:scale-95" aria-label="Previous day">
                            <ChevronLeftIcon className="w-5 h-5 text-text-main dark:text-dark-text-main" />
                        </button>
                        <h3 className="font-bold text-lg text-text-main dark:text-dark-text-main font-montserrat" aria-live="polite">
                            {formatDate(selectedDate, { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={() => changeDay(1)} className="p-2 rounded-full bg-card dark:bg-dark-card hover:bg-light-gray dark:hover:bg-dark-border shadow-sm transition-transform active:scale-95" aria-label="Next day">
                            <ChevronRightIcon className="w-5 h-5 text-text-main dark:text-dark-text-main" />
                        </button>
                    </div>
                    <DateSelector 
                        selectedDate={selectedDate} 
                        onDateChange={setSelectedDate} 
                        onDayClick={handleOpenCalendar} // Changed prop name to onDayClick
                    />
                </div>
                
                <div> {/* Removed touch event handlers for disabling swipe */}
                    <div className="p-4 space-y-6">
                        <DailySummaryCard 
                            caloriesIn={summary.calories}
                            caloriesOut={caloriesBurned}
                            calorieGoal={calorieGoal}
                        />

                        <ConcentricProgress 
                            summary={summary}
                            calorieGoal={calorieGoal}
                            macroGoals={macroGoals}
                            caloriesBurned={caloriesBurned}
                        />
                                
                        <WaterIntakePod 
                        currentIntake={waterIntake}
                        goal={waterGoal}
                        onAddWater={(amount) => handleWaterIntakeUpdate(dateString, waterIntake + amount)}
                        onRemoveWater={(amount) => handleWaterIntakeUpdate(dateString, Math.max(0, waterIntake - amount))}
                        onResetWater={() => handleWaterIntakeUpdate(dateString, 0)}
                        showToast={showToast}
                        />
                        
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-text-main dark:text-dark-text-main font-montserrat">
                                Logged Meals
                            </h2>

                            {mealsForDay.length > 0 ? (
                                <div className="space-y-4">
                                    <MealSummaryCard mealType={MealType.Breakfast} meals={mealsByType[MealType.Breakfast] || []} onMealClick={viewMealDetail} />
                                    <MealSummaryCard mealType={MealType.Lunch} meals={mealsByType[MealType.Lunch] || []} onMealClick={viewMealDetail} />
                                    <MealSummaryCard mealType={MealType.Dinner} meals={mealsByType[MealType.Dinner] || []} onMealClick={viewMealDetail} />
                                    <MealSummaryCard mealType={MealType.Snacks} mealsByType[MealType.Snacks] || []} onMealClick={viewMealDetail} />
                                </div>
                            ) : (
                                <div className="text-center py-8 px-4 bg-card dark:bg-dark-card rounded-2xl shadow-sm">
                                    <ChefHatIcon className="w-12 h-12 mx-auto text-medium-gray dark:text-dark-gray mb-4" />
                                    <p className="font-bold text-lg text-text-main dark:text-dark-text-main mb-1">Your day is a blank canvas!</p>
                                    <p className="text-sm text-text-light dark:text-dark-text-light mt-2">Tap the plus button to log your first meal and see your progress come to life.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Removed Quick Add FAB and Menu */}
                {/* Removed Main FAB and Menu */}

                <CalendarModal
                    isOpen={isCalendarModalOpen}
                    onClose={() => setIsCalendarModalOpen(false)}
                    selectedDate={selectedDate}
                    onSelectDate={handleCalendarDateSelect}
                />
            </>
        )}
    </div>
  );
};

export default DashboardScreen;