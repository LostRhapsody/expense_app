// types.ts

/**
 * UserPrefs
 * @interface UserPrefs
 * @description User preferences
 * @property {string} userId - the user's id
 * @property {string} themeName - the name of the theme
 * @property {number} clickerBudget - the user's budget
 * @property {string} createdAt - the date the userPrefs were created
 */
export interface UserPrefs {
  userId: string;
  themeName: string;
  clickerBudget: number;
  createdAt: string;
}

/**
 * FavoritesType
 * @interface FavoritesType
 * @description User's favorite pages
 * @property {string} label - the label of the favorite
 * @property {boolean} toggled - if the favorite is toggled
 * @property {string} icon - the icon of the favorite
 * @property {string} url - the url of the favorite
 */
export interface FavoritesType {
  label: string;
  toggled: boolean;
  icon: string;
  url: string;
}

/**
 * IOUType
 * @interface IOUType
 * @description User IOUs
 * @property {string} name - the IOU's name
 * @property {boolean} borrowed - if the IOU is borrowed
 * @property {number} amount - the amount of the IOU
 * @property {string} date - the date of the IOU
 */
export interface IOUType {
  name: string;
  borrowed: boolean;
  amount: number;
  date: string;
}

/**
 * ClickerTallyTypes
 * @interface ClickerTallyType
 * @description User clicker tallies
 * @property {string} userId - the user's id
 * @property {string} tallieId - the tally's id
 * @property {number} amount - the amount of the tally
 * @property {number} budgetUsed - the amount of the budget used
 * @property {number} budget - the user's budget
 * @property {string} dateCreated - the date the tally was created
 */
export interface ClickerTallyType {
  userId: string;
  tallieId: string;
  amount: number;
  budgetUsed: number;
  budget: number;
  dateCreated: string;
}

/**
 * ShoppingListType
 * @interface ShoppingListType
 * @description User shopping lists
 * @property {string} listId - the list's id
 * @property {string} userId - the user's id
 * @property {string} name - the name of the list
 * @property {string} createdAt - the date the list was created
 */
export interface ShoppingListType {
  listId: string;
  userId: string;
  name: string;
  createdAt: string;
}
