
import React, { useState, useMemo } from 'react';
import { FoodSearchResult, MealType, PreppedMeal, Page } from '../types';
import { PlusIcon, MinusIcon, BackIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface LogServingModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItem: FoodSearchResult | PreppedMeal;
  mealType: MealType;
  onLog: (item: FoodSearchResult | PreppedMeal, servings: number) => void;
}

const LogServingModal: React.FC<LogServingModalProps> = ({ isOpen, onClose, foodItem, mealType, onLog }) => {
  const [servings, setServings] = useState(1);
  const { navigateTo } = useAppContext();

  const isPreppedMeal = 'ingredients' in foodItem;

  const baseCalories = isPreppedMeal ? foodItem.caloriesPerServing : foodItem.calories;
  const baseProtein = isPreppedMeal ? foodItem.proteinPerServing : foodItem.protein;
  const baseCarbs = isPreppedMeal ? foodItem.carbsPerServing : foodItem.carbs;
  const baseFats = isPreppedMeal ? foodItem.fatsPerServing : foodItem.fats;

  const totalCalories = useMemo(() => Math.round(baseCalories * servings), [baseCalories, servings]);
  const totalProtein = useMemo(() => Math.round(baseProtein * servings), [baseProtein, servings]);
  const totalCarbs = useMemo(() => Math.round(baseCarbs * servings), [baseCarbs, servings]);
  const totalFats = useMemo(() => Math.round(baseFats * servings), [baseFats, servings]);

  const incrementServings = () => setServings(s => parseFloat((s + 0.5).toFixed(1)));
  const decrementServings = () => setServings(s => parseFloat(Math.max(0.5, s - 0.5).toFixed(1)));

  const handleLogClick = () => {
    onLog(foodItem, servings);
    navigateTo(Page.Dashboard); // Navigate to dashboard after logging
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-card dark:bg-dark-card rounded-t-3xl p-6 w-full max-w-md animate-slide-in-up shadow-[0_-10px_30px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center mb-6">
            <button onClick={onClose} className="p-2 -ml-2">
                <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
            </button>
            <h2 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto font-montserrat">Log {foodItem.name}</h2>
            <div className="w-6"></div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
            <div className="flex items-start">
                <img 
                    src={isPreppedMeal ? `https://placehold.co/80x80/FBBF24/FFFBEB?text=🍽️` : foodItem.imageUrl || `https://placehold.co/80x80/E0F8F2/00C795?text=🍴`}
                    alt={foodItem.name} 
                    className="w-20 h-20 rounded-lg object-cover mr-4 flex-shrink-0 bg-light-gray"
                />
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-main dark:text-dark-text-main mb-1 font-montserrat">{foodItem.name}</h3>
                    <p className="text-sm text-text-light dark:text-dark-text-light">
                        {isPreppedMeal ? 'Meal Prep' : foodItem.description} &bull; {mealType}
                    </p>
                    <p className="text-sm text-text-light dark:text-dark-text-light mt-1">
                        {Math.round(baseCalories)} kcal / serving
                    </p>
                </div>
            </div>

            <div className="text-center bg-light-gray dark:bg-dark-border p-4 rounded-xl">
                <p className="text-sm text-text-light dark:text-dark-text-light mb-1">Total Calories</p>
                <p className="text-5xl font-extrabold text-primary">{totalCalories}</p>
                <p className="text-sm text-text-light dark:text-dark-text-light">kcal</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-light-gray dark:bg-dark-border p-3 rounded-xl">
                    <p className="font-bold text-protein">{totalProtein}g</p>
                    <p className="text-xs text-text-light dark:text-dark-text-light">Protein</p>
                </div>
                <div className="bg-light-gray dark:bg-dark-border p-3 rounded-xl">
                    <p className="font-bold text-carbs">{totalCarbs}g</p>
                    <p className="text-xs text-text-light dark:text-dark-text-light">Carbs</p>
                </div>
                <div className="bg-light-gray dark:bg-dark-border p-3 rounded-xl">
                    <p className="font-bold text-fats">{totalFats}g</p>
                    <p className="text-xs text-text-light dark:text-dark-text-light">Fats</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-text-main dark:text-dark-text-main mb-2">Servings</label>
                <div className="flex items-center justify-center space-x-4 bg-light-gray dark:bg-dark-border p-3 rounded-xl">
                    <button onClick={decrementServings} className="p-2 rounded-full bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main hover:bg-light-gray dark:hover:bg-dark-border" aria-label="Decrease servings">
                        <MinusIcon className="w-6 h-6" />
                    </button>
                    <input 
                        type="number" 
                        value={servings.toFixed(1)} 
                        onChange={(e) => setServings(parseFloat(e.target.value) || 0.5)} 
                        className="w-24 text-center text-3xl font-bold bg-transparent outline-none text-text-main dark:text-dark-text-main [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        step="0.5" min="0.5" 
                    />
                    <button onClick={incrementServings} className="p-2 rounded-full bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main hover:bg-light-gray dark:hover:bg-dark-border" aria-label="Increase servings">
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>

        <div className="mt-6 flex flex-col space-y-3">
            <button onClick={handleLogClick} className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors">
                Log Meal
            </button>
            <button onClick={onClose} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main font-bold py-3 rounded-xl hover:bg-gray-200/70 dark:hover:bg-dark-border/70 transition-colors">
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default LogServingModal;