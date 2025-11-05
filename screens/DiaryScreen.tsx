

import React, { useState, useMemo } from 'react';
import { Page, Meal, MealType } from '../types.js';
// FIX: Removed duplicate import alias for ChevronRightIcon.
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, BellIcon, TrashIcon } from '../components/Icons.js';
import { toYYYYMMDD, formatDate } from '../utils/dateUtils.js';
import { useAppContext } from '../contexts/AppContext.js';
import { usePullToRefresh } from '../hooks/usePullToRefresh.js';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator.js';
// FIX: Changed import to a named import to match its export.
import { useSwipeToDelete } from '../hooks/useSwipeToDelete.js'; // Updated to relative import

const mealIcons: Record<MealType, string> = {
    [MealType.Breakfast]: '🥞',
    [MealType.Lunch]: '🥗',
    [MealType.Dinner]: '🍲',
    [MealType.Snacks]: '🍎',
};

const DiaryScreen: React.FC = () => {
    const { navigateTo, loggedMeals, viewMealDetail, handleMealRemoved, openRemindersModal, triggerHapticFeedback, showToast } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoadingData, setIsLoadingData] = useState(false); // For simulating refresh

    // Pull-to-refresh hook
    const handleRefresh = async () => {
        setIsLoadingData(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        setSelectedDate(new Date()); // Reset date to today or refetch current day's data
        setIsLoadingData(false);
        showToast({ text: "Diary refreshed!", type: 'info' });
    };
    const { isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd, scrollRef } = usePullToRefresh(handleRefresh);

    const changeDate = (amount: number) => {
        triggerHapticFeedback();
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount);
            return newDate;
        });
    };

    const handleDelete = (index: number, mealName: string) => {
        triggerHapticFeedback();
        if (window.confirm(`Are you sure you want to delete "${mealName}"?`)) {
            handleMealRemoved(index);
            showToast({ text: `${mealName} deleted.`, type: 'info' });
        }
    };

    const { mealsForDay, summary } = useMemo(() => {
        const dateString = toYYYYMMDD(selectedDate);
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
        
        return { mealsForDay: meals, summary };
    }, [selectedDate, loggedMeals]);

    const groupedMeals = useMemo(() => {
        return mealsForDay.reduce((acc, meal) => {
            (acc[meal.type] = acc[meal.type] || []).push(meal);
            return acc;
        }, {} as Record<MealType, (Meal & { originalIndex: number })[]>);
    }, [mealsForDay]);

    return (
        <div 
            className="bg-background dark:bg-dark-background min-h-full flex flex-col"
            ref={scrollRef as React.RefObject<HTMLDivElement>}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {isRefreshing && <PullToRefreshIndicator />}
            <header className="bg-background dark:bg-dark-background p-4 sticky top-0 z-10 space-y-4">
                <div className="flex justify-between items-center">
                    <button onClick={() => changeDate(-1)} className="p-2 transition-transform active:scale-95"><ChevronLeftIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" /></button>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-2xl font-bold text-text-main dark:text-dark-text-main font-montserrat">{formatDate(selectedDate)}</h1>
                            <button onClick={() => { triggerHapticFeedback(); openRemindersModal(); }} className="p-1 text-text-light dark:text-dark-text-light hover:text-primary dark:hover:text-primary transition-colors transition-transform active:scale-95">
                                <BellIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-text-light dark:text-dark-text-light">{selectedDate.getFullYear()}</p>
                    </div>
                    <button onClick={() => changeDate(1)} className="p-2 transition-transform active:scale-95"><ChevronRightIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" /></button>
                </div>
            </header>
            
            <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm flex justify-around text-center">
                    <div>
                        <p className="font-bold text-lg text-primary">{summary.calories}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light">Calories</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg text-protein">{summary.protein}g</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light">Protein</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg text-carbs">{summary.carbs}g</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light">Carbs</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg text-fats">{summary.fats}g</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light">Fats</p>
                    </div>
                </div>

                {Object.keys(groupedMeals).length === 0 ? (
                    <div className="text-center py-16 text-medium-gray dark:text-dark-gray">
                        <p className="text-lg mb-2">No meals logged for this day.</p>
                        <p>Tap the '+' button to add a meal.</p>
                    </div>
                ) : (
                    (Object.keys(MealType) as Array<keyof typeof MealType>).map(mealTypeKey => {
                        const type = MealType[mealTypeKey];
                        const meals = groupedMeals[type];
                        if (!meals || meals.length === 0) return null;
                        
                        const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

                        return (
                            <div key={type} className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{mealIcons[type]}</span>
                                        <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main font-montserrat">{type}</h2>
                                    </div>
                                    <span className="font-semibold text-text-main dark:text-dark-text-main">{totalCalories} cal</span>
                                </div>
                                <div className="space-y-2 divide-y divide-light-gray dark:divide-dark-border">
                                    {meals.map((meal) => (
                                        <MealItemWithSwipe 
                                            key={meal.originalIndex}
                                            meal={meal}
                                            onViewDetail={viewMealDetail}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Removed the fixed bottom-24 right-8 FAB as logging is now handled by BottomNav */}
        </div>
    );
};

// New component to encapsulate swipe functionality
const MealItemWithSwipe: React.FC<{ 
    meal: Meal & { originalIndex: number }; 
    onViewDetail: (index: number) => void; 
    onDelete: (index: number, name: string) => void;
}> = ({ meal, onViewDetail, onDelete }) => {
    const { translateX, bind, showDelete } = useSwipeToDelete();
    const { triggerHapticFeedback } = useAppContext();

    const handleDeleteClick = () => {
        onDelete(meal.originalIndex, meal.name);
    };

    const handleViewClick = () => {
        triggerHapticFeedback();
        onViewDetail(meal.originalIndex);
    };

    return (
        <div className="relative overflow-hidden pt-2 first:pt-0">
            <div 
                className="absolute inset-y-0 right-0 flex items-center bg-red-500 text-white transition-all duration-300"
                style={{ width: showDelete ? '100px' : '0px', transform: `translateX(${showDelete ? '0' : '100'}%)` }}
            >
                {showDelete && (
                    <button 
                        onClick={handleDeleteClick} 
                        className="h-full w-full flex items-center justify-center transition-transform active:scale-95"
                        aria-label={`Delete ${meal.name}`}
                    >
                        <TrashIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
            <div
                {...bind()}
                style={{ transform: `translateX(${translateX}px)` }}
                className="flex items-center w-full text-left transition-transform duration-200 bg-card dark:bg-dark-card rounded-lg"
            >
                <button 
                    onClick={handleViewClick}
                    className="flex-1 flex items-center text-left p-2 -m-2 rounded-lg hover:bg-light-gray dark:hover:bg-dark-border transition-transform active:scale-[0.98]"
                >
                    <div className="flex-1">
                        <p className="font-medium text-text-main dark:text-dark-text-main">{meal.name}</p>
                        <p className="text-sm text-text-light dark:text-dark-text-light">{meal.calories} cal</p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-medium-gray" />
                </button>
            </div>
        </div>
    );
};

export default DiaryScreen;