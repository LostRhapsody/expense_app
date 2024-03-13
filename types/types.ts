// types.ts

/**
 * UserPrefs
 * @interface UserPrefs
 * @description User preferences
 * @property {string} themeName - the name of the theme
 * @property {number} clickerBudget - the user's budget
 * @property {string} createdAt - the date the userPrefs were created
 */
export interface UserPrefs {
   themeName: string;
   clickerBudget: number;
   createdAt: string;
 }