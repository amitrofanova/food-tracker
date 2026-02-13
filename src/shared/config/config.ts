export const API_CONFIG = {
  baseUrl: 'https://world.openfoodfacts.org',
  defaultLang: navigator.language.split('-')[0].toLowerCase() || 'en',
  timeout: 10000,
}

export const APP_CONFIG = {
  dailyCalorieGoal: 2000,
  macroGoals: {
    protein: 120, // граммы
    fat: 65, // граммы
    carbs: 275, // граммы
  },
}
