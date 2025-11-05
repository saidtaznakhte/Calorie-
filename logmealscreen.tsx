import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Page, MealType, FoodSearchResult, Meal, FoodCategory, PreppedMeal } from '../types.js';
import { BackIcon, CameraIcon, SearchIcon, BarcodeIcon, PlusIcon, StarIcon, ChefHatIcon, TrashIcon, ChevronRightIcon, EditIcon, XIcon } from '../components/Icons.js';
import { searchFood } from '../services/geminiService.js';
import { toYYYYMMDD } from '../utils/dateUtils.js';
import { useAppContext } from '../contexts/AppContext.js';
import { popularFoods } from '../data/foodData.js';
import LogServingModal from '../components/LogServingModal.js'; // Import the new modal
import Skeleton from '../components/Skeleton.js'; // Import Skeleton component

const getDefaultMealType = (): MealType => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 11) return MealType.Breakfast;
    if (currentHour >= 11 && currentHour < 16) return MealType.Lunch;
    if (currentHour >= 16 && currentHour < 22) return MealType.Dinner;
    return MealType.Snacks;
};

const MealTypeFilter: React.FC<{
  selectedType: MealType;
  onSelectType: (type: MealType) => void;
}> = ({ selectedType, onSelectType }) => {
  const { triggerHapticFeedback } = useAppContext();
  const mealTypes = Object.values(MealType);
  return (
    <div className="flex space-x-3 overflow-x-auto pb-3 -mx-4 px-4">
      {mealTypes.map(type => (
        <button
          key={type}
          onClick={() => { triggerHapticFeedback(); onSelectType(type); }}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap transition-transform active:scale-95 ${
            selectedType === type
              ? 'bg-primary text-white shadow'
              : 'bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
};


const FoodCategoryFilter: React.FC<{
  selectedCategory: FoodCategory;
  onSelectCategory: (category: FoodCategory) => void;
}> = ({ selectedCategory, onSelectCategory }) => {
  const { triggerHapticFeedback } = useAppContext();
  const categories = Object.values(FoodCategory);
  return (
    <div className="flex space-x-3 overflow-x-auto pb-3 -mx-4 px-4">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => { triggerHapticFeedback(); onSelectCategory(category); }}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap transition-transform active:scale-95 ${
            selectedCategory === category
              ? 'bg-primary text-white shadow'
              : 'bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};


const MacroPill: React.FC<{ label: string; value: number; color: string; }> = ({ label, value, color }) => (
    <div className="flex items-center space-x-1.5">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <p className="text-xs text-text-light dark:text-dark-text-light">{label} {Math.round(value)}g</p>
    </div>
);

const SearchResultItem: React.FC<{ 
    item: FoodSearchResult | PreppedMeal; 
    onSelect: (item: FoodSearchResult | PreppedMeal) => void;
    isFavorite?: boolean; // Optional for PreppedMeal
    onToggleFavorite?: (item: FoodSearchResult) => void; // Optional for PreppedMeal
}> = ({ item, onSelect, isFavorite, onToggleFavorite }) => {
    const { triggerHapticFeedback } = useAppContext();
    const isPreppedMeal = 'ingredients' in item;

    return (
        <div onClick={() => { triggerHapticFeedback(); onSelect(item); }} className="flex items-start p-3 bg-card dark:bg-dark-card rounded-2xl cursor-pointer hover:shadow-md transition-shadow dark:border dark:border-transparent dark:hover:border-primary/20 transition-transform active:scale-[0.98]">
            <img 
                src={isPreppedMeal ? `https://placehold.co/64x64/FBBF24/FFFBEB?text=🍽️` : item.imageUrl || `https://placehold.co/64x64/E0F8F2/00C795?text=🍴`}
                alt={item.name} 
                className="w-16 h-16 rounded-lg object-cover mr-4 flex-shrink-0 bg-light-gray"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <p className="font-bold text-text-main dark:text-dark-text-main mb-1 pr-2">{item.name}</p>
                    {!isPreppedMeal && onToggleFavorite && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerHapticFeedback();
                                onToggleFavorite(item as FoodSearchResult);
                            }}
                            className="p-1 -mt-1 -mr-1 text-medium-gray dark:text-dark-gray transition-colors flex-shrink-0 transition-transform active:scale-95"
                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <StarIcon filled={isFavorite} className={`w-6 h-6 ${isFavorite ? 'text-carbs' : 'hover:text-carbs/70'}`} />
                        </button>
                    )}
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm text-text-light dark:text-dark-text-light truncate">{isPreppedMeal ? `${(item as PreppedMeal).caloriesPerServing} cal / serving` : item.description || 'Nutritional Info'}</p>
                        <div className="flex items-center space-x-3 mt-2">
                            <MacroPill label="P" value={isPreppedMeal ? (item as PreppedMeal).proteinPerServing : item.protein} color="bg-protein" />
                            <MacroPill label="C" value={isPreppedMeal ? (item as PreppedMeal).carbsPerServing : item.carbs} color="bg-carbs" />
                            <MacroPill label="F" value={isPreppedMeal ? (item as PreppedMeal).fatsPerServing : item.fats} color="bg-fats" />
                        </div>
                    </div>
                    <div className="text-right ml-2">
                        <p className="font-extrabold text-primary text-2xl">{Math.round(isPreppedMeal ? (item as PreppedMeal).caloriesPerServing : item.calories)}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light -mt-1">kcal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LogMealScreen: React.FC = () => {
    const { 
        navigateTo, 
        preppedMeals, 
        recentFoods, 
        addFoodToRecents,
        favoriteFoods,
        toggleFavoriteFood,
        // FIX: Destructure handleMealLogged from useAppContext
        handleMealLogged,
        showToast,
        triggerHapticFeedback, // Added triggerHapticFeedback
    } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType>(getDefaultMealType());
    const [activeCategory, setActiveCategory] = useState<FoodCategory>(FoodCategory.All);
    const hasSearched = useRef(false);
    
    // State for LogServingModal
    const [isServingModalOpen, setIsServingModalOpen] = useState(false);
    const [selectedFoodForServing, setSelectedFoodForServing] = useState<FoodSearchResult | PreppedMeal | null>(null);

    const foodList = useMemo(() => {
        if (activeCategory === FoodCategory.All) return popularFoods;
        if (activeCategory === FoodCategory.MealPrep) return [];
        return popularFoods.filter(food => food.category === activeCategory);
    }, [activeCategory]);
    
    const isFavorited = (food: FoodSearchResult) => 
        favoriteFoods.some(fav => fav.name.toLowerCase() === food.name.toLowerCase());

    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        if (query.length < 3) {
            setSearchResults([]);
            hasSearched.current = false;
            return;
        }
        const handler = setTimeout(async () => {
            setIsSearching(true);
            hasSearched.current = true;
            try {
                const results = await searchFood(searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleSelectFoodItem = (item: FoodSearchResult | PreppedMeal) => {
      setSelectedFoodForServing(item);
      setIsServingModalOpen(true);
    };

    const handleCloseServingModal = () => {
      setIsServingModalOpen(false);
      setSelectedFoodForServing(null);
    };

    // This function will be called from LogServingModal
    const handleLogWithServings = (item: FoodSearchResult | PreppedMeal, servings: number) => {
      if ('ingredients' in item) { // It's a PreppedMeal
        // handlePreppedMealLogged is called in AppContext via handleMealLogged
        const loggedMeal: Meal = {
          name: `${item.name} (${servings} serving${servings > 1 ? 's' : ''})`,
          calories: item.caloriesPerServing * servings,
          protein: item.proteinPerServing * servings,
          carbs: item.carbsPerServing * servings,
          fats: item.fatsPerServing * servings,
          type: selectedMealType,
          date: toYYYYMMDD(new Date()),
        };
        // This will trigger handleMealLogged with the showToast
        // and navigate to dashboard.
        // We bypass direct handlePreppedMealLogged to let AppContext handle the actual logging logic for prepped meals
        // which internally uses handleMealLogged.
        // The AppContext.tsx already handles handlePreppedMealLogged which calls handleMealLogged
        // and shows a toast. So we just pass the constructed meal here.
        // To avoid double navigation/toast, we just call handleMealLogged directly here.
        handleMealLogged(loggedMeal);
      } else { // It's a FoodSearchResult
        addFoodToRecents(item);
        const meal: Meal = {
          ...item,
          name: item.name,
          calories: item.calories * servings,
          protein: item.protein * servings,
          carbs: item.carbs * servings,
          fats: item.fats * servings,
          type: selectedMealType,
          date: toYYYYMMDD(new Date()),
        };
        handleMealLogged(meal);
      }
      showToast({ text: `${item.name} logged!`, type: 'success' }); // Show toast here after logging
      setIsServingModalOpen(false);
      setSelectedFoodForServing(null);
    };

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-4">
                <button onClick={() => { triggerHapticFeedback(); navigateTo(Page.Dashboard); }} className="p-2 -ml-2 transition-transform active:scale-95">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto font-montserrat">Log Meal</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex space-x-2 mb-4">
                <button onClick={() => { triggerHapticFeedback(); navigateTo(Page.Camera); }} className="flex-1 flex items-center justify-center py-3 bg-card dark:bg-dark-card rounded-lg shadow-sm transition-transform active:scale-95">
                    <CameraIcon className="w-5 h-5 mr-2 text-primary"/>
                    <span className="font-semibold text-sm text-text-main dark:text-dark-text-main">Snap Meal</span>
                </button>
                <button onClick={() => { triggerHapticFeedback(); navigateTo(Page.BarcodeScanner); }} className="flex-1 flex items-center justify-center py-3 bg-card dark:bg-dark-card rounded-lg shadow-sm transition-transform active:scale-95">
                    <BarcodeIcon className="w-5 h-5 mr-2 text-primary"/>
                    <span className="font-semibold text-sm text-text-main dark:text-dark-text-main">Scan Code</span>
                </button>
                 <button onClick={() => { triggerHapticFeedback(); navigateTo(Page.ManualLog); }} title="Manual Entry" className="flex items-center justify-center p-3 bg-card dark:bg-dark-card rounded-lg shadow-sm aspect-square transition-transform active:scale-95">
                    <EditIcon className="w-5 h-5 text-primary"/>
                </button>
                 <button onClick={() => { triggerHapticFeedback(); navigateTo(Page.MealPrepCreator); }} title="Meal Prep" className="flex items-center justify-center p-3 bg-card dark:bg-dark-card rounded-lg shadow-sm aspect-square transition-transform active:scale-95">
                    <ChefHatIcon className="w-5 h-5 text-primary"/>
                </button>
            </div>

            <div className="relative mb-4">
                {isSearching ? (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-medium-gray border-t-primary rounded-full animate-spin"></div>
                ) : (
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-medium-gray"/>
                )}
                <input 
                    type="text" placeholder="Search for food, brand..."
                    className="w-full bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main dark:placeholder-dark-text-light pl-11 pr-12 py-3 rounded-lg border border-light-gray dark:border-dark-border focus:border-primary focus:ring-0 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && !isSearching && (
                    <button 
                        onClick={() => { triggerHapticFeedback(); setSearchQuery(''); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-medium-gray hover:text-text-main dark:hover:text-dark-text-main transition-transform active:scale-95"
                        aria-label="Clear search"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            <div className="mb-4">
              <MealTypeFilter selectedType={selectedMealType} onSelectType={setSelectedMealType} />
            </div>
            
            <FoodCategoryFilter selectedCategory={activeCategory} onSelectCategory={setActiveCategory} />
            
            <div className="flex-1 overflow-y-auto mt-4 space-y-3">
                {isSearching ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start p-3 bg-card dark:bg-dark-card rounded-2xl shadow-sm">
                            <Skeleton className="w-16 h-16 rounded-lg mr-4" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <div className="flex space-x-2 mt-2">
                                    <Skeleton className="h-3 w-1/4" />
                                    <Skeleton className="h-3 w-1/4" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : hasSearched.current && searchResults.length === 0 ? (
                    <div className="text-center py-10 px-4 text-medium-gray dark:text-dark-gray">
                        <p className="font-semibold text-text-main dark:text-dark-text-main">No Results Found</p>
                        <p className="text-sm mt-1">We couldn't find any food matching "{searchQuery}".</p>
                    </div>
                ) : searchResults.length > 0 ? (
                    searchResults.map((food, index) => <SearchResultItem key={index} item={food} onSelect={handleSelectFoodItem} isFavorite={isFavorited(food)} onToggleFavorite={toggleFavoriteFood} />)
                ) : (
                    <>
                        {recentFoods.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-text-main dark:text-dark-text-main mb-2 font-montserrat">Recent Foods</h2>
                                <div className="flex overflow-x-auto space-x-3 pb-2 -mx-4 px-4">
                                    {recentFoods.map((food, index) => (
                                        <div key={`recent-${index}`} className="flex-shrink-0 w-60"> {/* Fixed width for horizontal scroll */}
                                            <SearchResultItem item={food} onSelect={handleSelectFoodItem} isFavorite={isFavorited(food)} onToggleFavorite={toggleFavoriteFood} />
                                        </div>
                                    ))}
                                </div>
                                <hr className="border-light-gray dark:border-dark-border mt-4"/>
                            </div>
                        )}

                        {activeCategory === FoodCategory.MealPrep && (
                           <div className="mb-6">
                            <h2 className="text-lg font-bold text-text-main dark:text-dark-text-main mb-2 font-montserrat">Your Meal Preps</h2>
                            <div className="space-y-3">
                               {preppedMeals.map(prep => (
                                    <SearchResultItem key={prep.id} item={prep} onSelect={handleSelectFoodItem} />
                                ))}
                            </div>
                           </div>
                        )}
                        {activeCategory !== FoodCategory.MealPrep && foodList.map((food, index) => <SearchResultItem key={index} item={food} onSelect={handleSelectFoodItem} isFavorite={isFavorited(food)} onToggleFavorite={toggleFavoriteFood} />)}
                    </>
                )}
            </div>

            {isServingModalOpen && selectedFoodForServing && (
                <LogServingModal
                    isOpen={isServingModalOpen}
                    onClose={handleCloseServingModal}
                    foodItem={selectedFoodForServing}
                    mealType={selectedMealType}
                    onLog={handleLogWithServings}
                />
            )}
        </div>
    );
};

export default LogMealScreen;