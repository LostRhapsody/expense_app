import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
   state: () => ({
      userId: '',
      createdAt: '',
      themeName: '',
      clickerBudget: 0,
   }),
   getters: {
      getUserId(): string {
         return this.userId;
      },
      getCreatedAt(): string {
         return this.createdAt;
      },
      getThemeName(): string {
         return this.themeName;
      },
      getClickerBudget(): number {
         return this.clickerBudget;
      },
   },
   actions: {
      setUserId(userId: string) {
         this.userId = userId;
      },
      setCreatedAt(createdAt: string) {
         this.createdAt = createdAt;
      },
      setThemeName(themeName: string) {
         this.themeName = themeName;
      },
      setClickerBudget(clickerBudget: number) {
         this.clickerBudget = clickerBudget;
      },
   },
});