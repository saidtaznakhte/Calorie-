import { UnitSystem } from '../types.js';

export const LBS_IN_KG = 2.20462262185;
export const INCHES_IN_CM = 0.393701;

// --- Conversion Functions ---
export const lbsToKg = (lbs) => lbs / LBS_IN_KG;
export const kgToLbs = (kg) => kg * LBS_IN_KG;
export const inchesToCm = (inches) => inches / INCHES_IN_CM;
export const cmToInches = (cm) => cm * INCHES_IN_CM;

// --- Display Formatting ---
export const formatWeight = (weightLbs, unitSystem) => {
  if (unitSystem === UnitSystem.Metric) {
    return `${lbsToKg(weightLbs).toFixed(1)} kg`;
  }
  return `${weightLbs.toFixed(1)} lbs`;
};

export const formatHeight = (heightInches, unitSystem) => {
  if (unitSystem === UnitSystem.Metric) {
    return `${inchesToCm(heightInches).toFixed(0)} cm`;
  }
  const feet = Math.floor(heightInches / 12);
  const inches = Math.round(heightInches % 12);
  return `${feet}' ${inches}"`;
};

// --- Parsers for Inputs ---
export const getDisplayWeight = (weightLbs, unitSystem) => {
    if (unitSystem === UnitSystem.Metric) {
        return parseFloat(lbsToKg(weightLbs).toFixed(1));
    }
    return parseFloat(weightLbs.toFixed(1));
};

export const getDisplayHeightCm = (heightInches) => {
    return Math.round(inchesToCm(heightInches));
}

export const getDisplayHeightFt = (heightInches) => {
    return Math.floor(heightInches / 12);
}

export const getDisplayHeightIn = (heightInches) => {
    return Math.round(heightInches % 12);
}