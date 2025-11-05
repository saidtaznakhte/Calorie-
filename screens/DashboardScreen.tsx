

import React, { useState, useMemo } from 'react';
import { Page, MealType, Meal, FoodSearchResult } from '../types';
import { BellIcon, ChevronLeftIcon, ChevronRightIcon, ChefHatIcon, CalendarIcon } from '../components/Icons';
import { toYYYYMMDD, formatDate, isToday, isYesterday } from '../utils/dateUtils';
import { useAppContext } from '../contexts/AppContext';
import ConcentricProgress from '../components/ConcentricProgress';
import WaterIntakePod from '../components/WaterIntakePod';
import DateSelector from '../components/DateSelector';
import DailySummaryCard from '../components/DailySummaryCard';
import StreakCounter from '../components/StreakCounter';
import CalendarModal from '../components/CalendarModal';
import { popularFoods } from '../data/foodData';

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
                        onClick={() => onMealClick(meal.originalIndex)}
                        className="flex justify-between text-sm w-full text-left p-1 -m-1 rounded hover:bg-light-gray dark:hover:bg-dark-border"
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
    } = useAppContext();

    const [selectedDate, setSelectedDate] = useState(new Date());
    // Removed isFabMenuOpen, isQuickAddMenuOpen states
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false); // New state for calendar modal

    const dateString = toYYYYMMDD(selectedDate);
    const waterIntake = waterIntakeHistory[dateString] || 0;

    const { mealsForDay, summary, caloriesBurned } = useMemo(() => {
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
    }, [selectedDate, loggedMeals, loggedActivities]);
    
    const calorieGoal = useMemo(() => (macroGoals.protein * 4) + (macroGoals.carbs * 4) + (macroGoals.fats * 9), [macroGoals]);

    const mealsByType = useMemo(() => {
      return mealsForDay.reduce((acc, meal) => {
        // FIX: Corrected typo `meal[Type]` to `meal.type`
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
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + offset);
            return newDate;
        });
    };

    const handleOpenCalendar = () => {
        setIsCalendarModalOpen(true);
    };

    const handleCalendarDateSelect = (date: Date) => {
        setSelectedDate(date);
        setIsCalendarModalOpen(false);
    };

    // Removed quickAddFood function as quick add FAB is removed.


  return (
    <div className="bg-background dark:bg-dark-background min-h-full overflow-x-hidden">
      <header className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-dark-text-main font-montserrat">Hello, {profile.name}!</h1>
          <p className="text-text-light dark:text-dark-text-light">{dateSubtext}</p>
        </div>
        <div className="flex items-center space-x-2">
            <StreakCounter streak={dayStreak} />
            <button className="relative p-2">
            <BellIcon className="w-6 h-6 text-text-light dark:text-dark-text-light" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-background dark:border-dark-background"></span>
            </button>
        </div>
      </header>
      
      <div className="p-4">
          <div className="flex justify-between items-center mb-4">
              <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-dark-card" aria-label="Previous day">
                  <ChevronLeftIcon className="w-5 h-5 text-text-main dark:text-dark-text-main" />
              </button>
              <h3 className="font-bold text-lg text-text-main dark:text-dark-text-main font-montserrat" aria-live="polite">
                  {formatDate(selectedDate, { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-dark-card" aria-label="Next day">
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
                        <MealSummaryCard mealType={MealType.Snacks} meals={mealsByType[MealType.Snacks] || []} onMealClick={viewMealDetail} />
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
    </div>
  );
};

export default DashboardScreen;
