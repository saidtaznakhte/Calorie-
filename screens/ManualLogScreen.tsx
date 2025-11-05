
import React, { useState } from 'react';
import { Page, Meal, MealType } from '../types';
import { BackIcon } from '../components/Icons';
import { useAppContext } from '../contexts/AppContext';
import { toYYYYMMDD } from '../utils/dateUtils';

const InputField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    unit?: string;
}> = ({ label, name, value, onChange, type = 'text', placeholder, unit }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat">{label}</label>
        <div className="relative">
            <input 
                id={name} 
                name={name} 
                type={type} 
                value={value} 
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" 
            />
            {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-light">{unit}</span>}
        </div>
    </div>
);

const ManualLogScreen: React.FC = () => {
    const { navigateTo, handleMealLogged, showToast, triggerHapticFeedback } = useAppContext();
    const [mealName, setMealName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.Snacks);

    const handleLogMeal = () => {
        triggerHapticFeedback();
        const parsedCalories = parseInt(calories);
        const parsedProtein = parseInt(protein);
        const parsedCarbs = parseInt(carbs);
        const parsedFats = parseInt(fats);

        if (!mealName.trim() || isNaN(parsedCalories) || isNaN(parsedProtein) || isNaN(parsedCarbs) || isNaN(parsedFats)) {
            showToast({ text: "Please fill in all fields with valid numbers.", type: 'error' });
            return;
        }

        const newMeal: Meal = {
            name: mealName.trim(),
            calories: parsedCalories,
            protein: parsedProtein,
            carbs: parsedCarbs,
            fats: parsedFats,
            type: selectedMealType,
            date: toYYYYMMDD(new Date()),
        };

        handleMealLogged(newMeal);
        // The handleMealLogged function already navigates to Dashboard and shows a toast.
    };

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-6">
                <button onClick={() => { triggerHapticFeedback(); navigateTo(Page.LogMeal); }} className="p-2 -ml-2 transition-transform active:scale-95">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto font-montserrat">Manual Log</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex-1 overflow-y-auto bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                    <label htmlFor="mealType" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat">Meal Type</label>
                    <select 
                        id="mealType" 
                        value={selectedMealType} 
                        onChange={(e) => setSelectedMealType(e.target.value as MealType)} 
                        className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none"
                    >
                        {Object.values(MealType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <InputField 
                    label="Meal Name"
                    name="mealName"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="e.g., Homemade Pasta"
                />
                <InputField 
                    label="Calories"
                    name="calories"
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    unit="kcal"
                    placeholder="e.g., 500"
                />
                <div className="grid grid-cols-3 gap-4">
                    <InputField 
                        label="Protein"
                        name="protein"
                        type="number"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        unit="g"
                        placeholder="e.g., 30"
                    />
                    <InputField 
                        label="Carbs"
                        name="carbs"
                        type="number"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        unit="g"
                        placeholder="e.g., 60"
                    />
                    <InputField 
                        label="Fats"
                        name="fats"
                        type="number"
                        value={fats}
                        onChange={(e) => setFats(e.target.value)}
                        unit="g"
                        placeholder="e.g., 20"
                    />
                </div>
            </div>

            <div className="mt-6">
                <button 
                    onClick={handleLogMeal} 
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors transition-transform active:scale-95"
                >
                    Log Meal
                </button>
            </div>
        </div>
    );
};

export default ManualLogScreen;