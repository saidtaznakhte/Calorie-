import { Gender, ActivityLevel, PrimaryGoal } from '../types.js';

export const calculateGoals = (profile, weightLbs) => {
    const weightInKg = weightLbs / 2.20462;
    const heightInCm = profile.height * 2.54;
    
    let bmr;
    if (profile.gender === Gender.Male) {
        bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) + 5;
    } else if (profile.gender === Gender.Female) {
        bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) - 161;
    } else {
        bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) - 78;
    }

    const activityMultipliers = {
        [ActivityLevel.Sedentary]: 1.2,
        [ActivityLevel.LightlyActive]: 1.375,
        [ActivityLevel.ModeratelyActive]: 1.55,
        [ActivityLevel.Active]: 1.725,
        [ActivityLevel.VeryActive]: 1.9,
    };
    
    const maintenanceCalories = bmr * activityMultipliers[profile.activityLevel];

    let targetCalories;
    switch (profile.primaryGoal) {
        case PrimaryGoal.LoseWeight:
            targetCalories = maintenanceCalories - 500;
            break;
        case PrimaryGoal.GainMuscle:
            targetCalories = maintenanceCalories + 300;
            break;
        case PrimaryGoal.MaintainWeight:
        default:
            targetCalories = maintenanceCalories;
            break;
    }
    
    const carbs = Math.round((targetCalories * 0.40) / 4);
    const protein = Math.round((targetCalories * 0.30) / 4);
    const fats = Math.round((targetCalories * 0.30) / 9);

    return { protein, carbs, fats };
};