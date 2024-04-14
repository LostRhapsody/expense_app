import { defineStore } from "pinia";
import type {FavoritesType} from "@/types/types";

export const useFavoritesStore = defineStore("favorites", {
  state: () => ({
    favorites: [] as FavoritesType[],
  }),
  getters: {
    getFavorites(): FavoritesType[] {
      return this.favorites;
    },
  },
  actions: {
    setFavorites(favorite: FavoritesType[]) {
      this.favorites =favorite;
    },
    deleteFavorites() {
      this.favorites = [];
    },
  },
});
