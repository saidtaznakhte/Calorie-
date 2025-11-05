


import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo, useRef } from 'react';
import { Page, Meal, Theme, MacroGoals, WeightEntry, UserProfile, FoodSearchResult, Activity, UserData, Gender, ActivityLevel, PrimaryGoal, UnitSystem, PreppedMeal, MealType, ThemePreference, CustomActivity, ReminderSettings, ReminderType } from '../types.js';
import { toYYYYMMDD } from '../utils/dateUtils.js';
import { calculateGoals } from '../utils/nutritionUtils.js';

// A custom hook to manage state in localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    // Wrap setStoredValue to get the latest state and update localStorage synchronously
    setStoredValue(prevState => {
        const valueToStore = value instanceof Function ? value(prevState) : value;
        try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
        return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}


const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [usersData, setUsersData] = useLocalStorage('cal-ai-users-data', {});
  const [currentUserId, setCurrentUserId] = useLocalStorage('cal-ai-current-user-id', null);
  const [theme, setTheme] = useState('light');
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedMealIndex, setSelectedMealIndex] = useState(null);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null); // Updated state type
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000); // Toast disappears after 3 seconds
  }, []);

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Vibrate for 50ms
    }
  }, []);

  const currentUser = useMemo(() => {
    return currentUserId ? usersData[currentUserId] : null;
  }, [currentUserId, usersData]);

  const selectedMeal = useMemo(() => {
    if (currentUser && selectedMealIndex !== null && currentUser.loggedMeals[selectedMealIndex]) {
        return { meal: currentUser.loggedMeals[selectedMealIndex], index: selectedMealIndex };
    }
    return null;
  }, [currentUser, selectedMealIndex]);
  
  useEffect(() => {
    const preference = currentUser?.themePreference || 'system';
    const root = window.document.documentElement;

    const applyTheme = (t) => {
        setTheme(t);
        root.classList.remove('light', 'dark');
        root.classList.add(t);
    };

    if (preference === 'light' || preference === 'dark') {
        applyTheme(preference);
        return; 
    }

    // Handle 'system' preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const changeHandler = (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
    };

    applyTheme(darkModeQuery.matches ? 'dark' : 'light');
    darkModeQuery.addEventListener('change', changeHandler);

    return () => darkModeQuery.removeEventListener('change', changeHandler);
  }, [currentUser?.themePreference]);

  // --- Notification Manager ---
    const notificationIntervalRef = useRef(null);
    const lastNotifiedRef = useRef({}); // e.g., { Breakfast: '2023-10-27', ... }

    useEffect(() => {
        if (notificationIntervalRef.current) {
            clearInterval(notificationIntervalRef.current);
        }

        if (!currentUser || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
            return;
        }

        const { reminders } = currentUser;

        notificationIntervalRef.current = window.setInterval(() => {
            const now = new Date();
            const todayStr = toYYYYMMDD(now);
            const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            Object.keys(reminders).forEach(key => {
                const reminderType = key;
                const reminder = reminders[reminderType];

                if (reminder.enabled && reminder.time === currentTimeStr) {
                    if (lastNotifiedRef.current[reminderType] !== todayStr) {
                        let title = '🍽️ Meal Time!';
                        let body = `Don't forget to log your ${reminderType}.`;

                        if (reminderType === 'Water') {
                            title = '💧 Stay Hydrated!';
                            body = "Time to log your water intake.";
                        }
                        
                        new Notification(title, { body, icon: './vite.svg' });
                        lastNotifiedRef.current[reminderType] = todayStr;
                    }
                }
            });
        }, 30000); // Check every 30 seconds

        return () => {
            if (notificationIntervalRef.current) {
                clearInterval(notificationIntervalRef.current);
            }
        };
    }, [currentUser?.reminders, currentUser?.profile.id]);

  const users = useMemo(() => {
    return Object.values(usersData).map(ud => ud.profile);
  }, [usersData]);

  const updateCurrentUser = useCallback((updater) => {
    if (!currentUserId) return;
    setUsersData(prevUsersData => {
      const currentUserData = prevUsersData[currentUserId];
      if (!currentUserData) {
        return prevUsersData;
      }
      const updatedUserData = updater(currentUserData);
      return {
        ...prevUsersData,
        [currentUserId]: updatedUserData,
      };
    });
  }, [currentUserId, setUsersData]);

  const login = useCallback((userId) => {
    if (usersData[userId]) {
      setCurrentUserId(userId);
    }
  }, [usersData, setCurrentUserId]);

  const logout = useCallback(() => {
    setCurrentUserId(null);
  }, [setCurrentUserId]);

  const register = useCallback((profileData, currentWeightLbs) => {
    const id = crypto.randomUUID();
    const newProfile = { ...profileData, id };
    
    const initialMacroGoals = calculateGoals(profileData, currentWeightLbs);
    
    const newUser = {
        profile: newProfile,
        loggedMeals: [],
        loggedActivities: [],
        macroGoals: initialMacroGoals,
        weightHistory: [{ date: toYYYYMMDD(new Date()), weight: currentWeightLbs }],
        goalWeight: profileData.primaryGoal === PrimaryGoal.LoseWeight ? currentWeightLbs - 15 : currentWeightLbs,
        waterIntakeHistory: {},
        waterGoal: 90,
        stepsHistory: {},
        stepsGoal: 10000,
        dayStreak: 0,
        favoriteFoods: [],
        preppedMeals: [],
        page: Page.Dashboard,
        themePreference: 'system',
        customActivities: [],
        recentFoods: [],
        reminders: {
            Breakfast: { enabled: false, time: '08:00' },
            Lunch: { enabled: false, time: '12:30' },
            Dinner: { enabled: false, time: '18:30' },
            Snacks: { enabled: false, time: '15:00' },
            Water: { enabled: false, time: '10:00' },
        },
    };

    setUsersData(prevUsersData => ({ ...prevUsersData, [id]: newUser }));
    setCurrentUserId(id);
    setIsRegistering(false);
  }, [setUsersData, setCurrentUserId]);

  const deleteCurrentUser = useCallback(() => {
     if (currentUserId && window.confirm("DANGER: Are you sure you want to delete this profile? This action is irreversible.")) {
      setUsersData(prevUsersData => {
        const newUsersData = { ...prevUsersData };
        delete newUsersData[currentUserId];
        return newUsersData;
      });
      setCurrentUserId(null);
    }
  }, [currentUserId, setUsersData, setCurrentUserId]);

  const navigateTo = useCallback((newPage) => {
    if (currentUser?.page === Page.MealDetail && newPage !== Page.MealDetail) {
      setSelectedMealIndex(null);
    }
    updateCurrentUser(ud => ({ ...ud, page: newPage }));
  }, [updateCurrentUser, currentUser?.page]);
  
  const viewMealDetail = useCallback((index) => {
    setSelectedMealIndex(index);
    if (index !== null) {
      navigateTo(Page.MealDetail);
    }
  }, [navigateTo]);

  const handleThemePreferenceChange = useCallback((preference) => {
    updateCurrentUser(ud => ({ ...ud, themePreference: preference }));
  }, [updateCurrentUser]);
  
  const handleLog = (ud, type, log) => {
    const todayStr = toYYYYMMDD(new Date());
    let newStreak = ud.dayStreak;

    // Only update streak if the log is for today
    if (log.date === todayStr) {
      const allLogs = [...ud.loggedMeals, ...ud.loggedActivities];
      const hasLogToday = allLogs.some(l => l.date === todayStr);

      if (!hasLogToday) { // This is the first log of today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = toYYYYMMDD(yesterday);
        const hasLogYesterday = allLogs.some(l => l.date === yesterdayStr);
        newStreak = hasLogYesterday ? (ud.dayStreak || 0) + 1 : 1;
      }
    }

    const updatedMeals = type === 'meal' ? [...ud.loggedMeals, log] : ud.loggedMeals;
    const updatedActivities = type === 'activity' ? [...ud.loggedActivities, log] : ud.loggedActivities;
    
    return { ...ud, loggedMeals: updatedMeals, loggedActivities: updatedActivities, dayStreak: newStreak, page: Page.Dashboard };
};


  const handleMealLogged = useCallback((meal) => {
    updateCurrentUser(ud => handleLog(ud, 'meal', meal));
    showToast({ text: `${meal.name} logged!`, type: 'success' }); // Updated call to showToast
  }, [updateCurrentUser, showToast]);
  
  const handleActivityLogged = useCallback((activity) => {
      updateCurrentUser(ud => handleLog(ud, 'activity', activity));
      showToast({ text: `${activity.name} logged!`, type: 'success' }); // Updated call to showToast
  }, [updateCurrentUser, showToast]);

  const handleMealRemoved = useCallback((mealIndex) => {
    updateCurrentUser(ud => ({
      ...ud,
      loggedMeals: ud.loggedMeals.filter((_, index) => index !== mealIndex),
    }));
  }, [updateCurrentUser]);

  const handleMealRemovedAndNavigate = useCallback((mealIndex, newPage) => {
    updateCurrentUser(ud => ({
        ...ud,
        loggedMeals: ud.loggedMeals.filter((_, index) => index !== mealIndex),
        page: newPage,
    }));
    setSelectedMealIndex(null);
  }, [updateCurrentUser]);
  
  const handleActivityRemoved = useCallback((activityIndex) => {
      updateCurrentUser(ud => ({
        ...ud,
        loggedActivities: ud.loggedActivities.filter((_, index) => index !== activityIndex),
      }));
  }, [updateCurrentUser]);

  const handleMacrosUpdate = useCallback((newGoals) => {
    updateCurrentUser(ud => ({ ...ud, macroGoals: newGoals, page: Page.Settings }));
  }, [updateCurrentUser]);

  const handleWeightUpdate = useCallback((newCurrentWeight, newGoalWeight) => {
    updateCurrentUser(ud => {
      const newHistory = [...ud.weightHistory];
      const todayStr = toYYYYMMDD(new Date());
      const todayEntryIndex = newHistory.findIndex(e => e.date === todayStr);
      if (todayEntryIndex > -1) {
        newHistory[todayEntryIndex] = { date: todayStr, weight: newCurrentWeight };
      } else {
        newHistory.push({ date: todayStr, weight: newCurrentWeight });
      }
      newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { ...ud, weightHistory: newHistory, goalWeight: newGoalWeight, page: Page.Settings };
    });
  }, [updateCurrentUser]);

  const handleProfileUpdate = useCallback((newProfile) => {
    updateCurrentUser(ud => {
      const weight = ud.weightHistory[ud.weightHistory.length - 1]?.weight || 150;
      const updatedGoals = calculateGoals(newProfile, weight);
      return { ...ud, profile: newProfile, macroGoals: updatedGoals, page: Page.Settings };
    });
  }, [updateCurrentUser]);

  const handleWaterIntakeUpdate = useCallback((date, newIntake) => {
      updateCurrentUser(ud => ({
          ...ud,
          waterIntakeHistory: {
              ...ud.waterIntakeHistory,
              [date]: newIntake,
          }
      }));
      showToast({ text: "Water logged!", type: 'success' }); // Updated call to showToast
  }, [updateCurrentUser, showToast]);

  const toggleFavoriteFood = useCallback((food) => {
    updateCurrentUser(ud => {
        const isFavorite = ud.favoriteFoods.some(f => f.name.toLowerCase() === food.name.toLowerCase());
        const newFavorites = isFavorite
            ? ud.favoriteFoods.filter(f => f.name.toLowerCase() !== food.name.toLowerCase())
            : [...ud.favoriteFoods, food];
        return { ...ud, favoriteFoods: newFavorites };
    });
  }, [updateCurrentUser]);
  
  const handlePreppedMealAdd = useCallback((meal) => {
      const newMeal = { ...meal, id: crypto.randomUUID() };
      updateCurrentUser(ud => ({ ...ud, preppedMeals: [...ud.preppedMeals, newMeal] }));
  }, [updateCurrentUser]);

  const handlePreppedMealLogged = useCallback((logDetails) => {
      const { meal, servings, mealType, date } = logDetails;
      const loggedMeal = {
          name: `${meal.name} (${servings} serving${servings > 1 ? 's' : ''})`,
          calories: meal.caloriesPerServing * servings,
          protein: meal.proteinPerServing * servings,
          carbs: meal.carbsPerServing * servings,
          fats: meal.fatsPerServing * servings,
          type: mealType,
          date: date,
      };
      // No explicit showToast here, as it's typically called by the LogServingModal
      // or other logging components after this function completes.
      handleMealLogged(loggedMeal); 
  }, [handleMealLogged]);

  const handlePreppedMealDelete = useCallback((mealId) => {
      updateCurrentUser(ud => ({ ...ud, preppedMeals: ud.preppedMeals.filter(m => m.id !== mealId) }));
  }, [updateCurrentUser]);

  const handleCustomActivityAdd = useCallback((activity) => {
      updateCurrentUser(ud => ({ ...ud, customActivities: [...ud.customActivities, activity] }));
  }, [updateCurrentUser]);

  const addFoodToRecents = useCallback((food) => {
      updateCurrentUser(ud => {
          const newRecents = [food, ...ud.recentFoods.filter(f => f.name !== food.name)];
          return { ...ud, recentFoods: newRecents.slice(0, 5) }; // Keep only last 5
      });
  }, [updateCurrentUser]);
  
  const handleRemindersUpdate = useCallback((newSettings) => {
      updateCurrentUser(ud => ({ ...ud, reminders: newSettings }));
  }, [updateCurrentUser]);
  
  const openRemindersModal = useCallback(() => setIsRemindersModalOpen(true), []);
  const closeRemindersModal = useCallback(() => setIsRemindersModalOpen(false), []);

  const startRegistration = useCallback(() => setIsRegistering(true), []);
  const cancelRegistration = useCallback(() => setIsRegistering(false), []);

  const contextValue = {
    // Auth
    currentUserId, currentUser, users, login, logout, register, deleteCurrentUser, startRegistration, cancelRegistration, isRegistering,
    
    // State (defaults for when logged out)
    page: currentUser?.page || Page.Dashboard,
    loggedMeals: currentUser?.loggedMeals || [],
    loggedActivities: currentUser?.loggedActivities || [],
    theme,
    themePreference: currentUser?.themePreference || 'system',
    profile: currentUser?.profile || { id: '', name: '', age: 0, avatar: '', gender: Gender.Male, height: 0, activityLevel: ActivityLevel.Sedentary, primaryGoal: PrimaryGoal.MaintainWeight, unitSystem: UnitSystem.Imperial },
    macroGoals: currentUser?.macroGoals || { protein: 0, carbs: 0, fats: 0 },
    weightHistory: currentUser?.weightHistory || [],
    goalWeight: currentUser?.goalWeight || 0,
    currentWeight: currentUser?.weightHistory[currentUser.weightHistory.length - 1]?.weight || 0,
    waterIntakeHistory: currentUser?.waterIntakeHistory || {},
    waterGoal: currentUser?.waterGoal || 90,
    stepsHistory: currentUser?.stepsHistory || {},
    stepsGoal: currentUser?.stepsGoal || 10000,
    dayStreak: currentUser?.dayStreak || 0,
    favoriteFoods: currentUser?.favoriteFoods || [],
    preppedMeals: currentUser?.preppedMeals || [],
    customActivities: currentUser?.customActivities || [],
    selectedMeal,
    recentFoods: currentUser?.recentFoods || [],
    isRemindersModalOpen,
    toastMessage,

    // Actions
    navigateTo, handleThemePreferenceChange, handleMealLogged, handleMealRemoved, handleMealRemovedAndNavigate, handleActivityLogged, handleActivityRemoved, handleMacrosUpdate, handleWeightUpdate, handleProfileUpdate, handleWaterIntakeUpdate, toggleFavoriteFood, handlePreppedMealAdd, handlePreppedMealLogged, handlePreppedMealDelete, handleCustomActivityAdd, viewMealDetail, addFoodToRecents, handleRemindersUpdate, openRemindersModal, closeRemindersModal, showToast, triggerHapticFeedback
  };

  return React.createElement(AppContext.Provider, { value: contextValue }, children);
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};