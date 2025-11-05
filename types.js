

export const Page = {
  Dashboard: 'DASHBOARD',
  Diary: 'DIARY',
  Progress: 'PROGRESS',
  Settings: 'SETTINGS',
  LogMeal: 'LOG_MEAL',
  Camera: 'CAMERA',
  BarcodeScanner: 'BARCODE_SCANNER',
  AdjustMacros: 'ADJUST_MACROS',
  WeightGoals: 'WEIGHT_GOALS',
  WeightHistory: 'WEIGHT_HISTORY',
  WaterHistory: 'WATER_HISTORY',
  Profile: 'PROFILE',
  LogActivity: 'LOG_ACTIVITY',
  ManualLog: 'MANUAL_LOG',
  MealPrepCreator: 'MEAL_PREP_CREATOR',
  MealDetail: 'MEAL_DETAIL',
};

export const MealType = {
    Breakfast: 'Breakfast',
    Lunch: 'Lunch',
    Dinner: 'Dinner',
    Snacks: 'Snacks'
};

export const FoodCategory = {
  All: 'All',
  MealPrep: 'Meal Prep',
  Fruits: 'Fruits',
  Veggies: 'Veggies',
  Protein: 'Protein',
  Carbs: 'Carbs',
  Dairy: 'Dairy',
  Dishes: 'Dishes',
};

export const ActivityType = {
  Running: 'Running',
  Walking: 'Walking',
  Cycling: 'Cycling',
  WeightLifting: 'Weight Lifting',
  Yoga: 'Yoga',
  Swimming: 'Swimming',
};

export const Gender = {
    Male: 'Male',
    Female: 'Female',
    Other: 'Prefer not to say',
};

export const ActivityLevel = {
    Sedentary: 'Sedentary', // Little to no exercise
    LightlyActive: 'Lightly Active', // Light exercise/sports 1-3 days/week
    ModeratelyActive: 'Moderately Active', // Moderate exercise/sports 3-5 days/week
    Active: 'Active', // Hard exercise/sports 6-7 days a week
    VeryActive: 'VeryActive', // Very hard exercise & physical job
};

export const PrimaryGoal = {
    LoseWeight: 'Lose Weight',
    MaintainWeight: 'Maintain Weight',
    GainMuscle: 'Gain Muscle',
};

export const UnitSystem = {
    Imperial: 'imperial',
    Metric: 'metric',
};


// export type Theme = 'light' | 'dark'; // Removed: TypeScript type declaration
// export type ThemePreference = 'light' | 'dark' | 'system'; // Removed: TypeScript type declaration

// export interface UserProfile { // Removed: TypeScript interface definition, it's not valid JS. Assuming this is covered by data structures.
//     id: string;
//     name: string;
//     age: number;
//     avatar: string;
//     gender: Gender;
//     height: number; // in inches
//     activityLevel: ActivityLevel;
//     primaryGoal: PrimaryGoal;
//     unitSystem: UnitSystem;
// }

// export interface MacroGoals { // Removed: TypeScript interface definition
//     protein: number;
//     carbs: number;
//     fats: number;
// }

// export interface WeightEntry { // Removed: TypeScript interface definition
//     date: string; // YYYY-MM-DD
//     weight: number; // in lbs
// }

// export interface Meal { // Removed: TypeScript interface definition
//     name: string;
//     description?: string;
//     calories: number;
//     protein: number;
//     carbs: number;
//     fats: number;
//     fiber?: number;
//     sugar?: number;
//     sodium?: number;
//     type: MealType;
//     date: string; // YYYY-MM-DD
// }

// export interface CustomActivity { // Removed: TypeScript interface definition
//     type: string;
//     emoji: string;
//     met: number;
// }

// export interface Activity { // Removed: TypeScript interface definition
//     name: string;
//     type: string;
//     duration: number; // in minutes
//     caloriesBurned: number;
//     date: string; // YYYY-MM-DD
// }

// export interface FoodSearchResult { // Removed: TypeScript interface definition
//     name: string;
//     description?: string;
//     calories: number;
//     protein: number;
//     carbs: number;
//     fats: number;
//     imageUrl?: string;
//     category?: FoodCategory;
// }

// export interface MealAnalysis extends Omit<Meal, 'date'> { // Removed: TypeScript interface definition
//     fiber?: number;
//     sugar?: number;
//     sodium?: number;
//     portionSuggestion?: string;
//     type: MealType;
// }

// export interface PreppedMeal { // Removed: TypeScript interface definition
//     id: string;
//     name: string;
//     servings: number;
//     ingredients: FoodSearchResult[];
//     caloriesPerServing: number;
//     proteinPerServing: number;
//     carbsPerServing: number;
//     fatsPerServing: number;
// }

// export interface Reminder { // Removed: TypeScript interface definition
//     enabled: boolean;
//     time: string; // "HH:MM"
// }

// export type ReminderType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Water'; // Removed: TypeScript type declaration

// export type ReminderSettings = Record<ReminderType, Reminder>; // Removed: TypeScript type declaration

// export interface UserData { // Removed: TypeScript interface definition
//     profile: UserProfile;
//     loggedMeals: Meal[];
//     loggedActivities: Activity[];
//     macroGoals: MacroGoals;
//     weightHistory: WeightEntry[];
//     goalWeight: number; // in lbs
//     waterIntakeHistory: { [date: string]: number };
//     waterGoal: number;
//     stepsHistory: { [date: string]: number };
//     stepsGoal: number;
//     dayStreak: number;
//     favoriteFoods: FoodSearchResult[];
//     preppedMeals: PreppedMeal[];
//     page: Page;
//     themePreference: ThemePreference;
//     customActivities: CustomActivity[];
//     recentFoods: FoodSearchResult[];
//     reminders: ReminderSettings;
// }
