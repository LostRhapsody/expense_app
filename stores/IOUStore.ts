import { defineStore } from "pinia";
import type {IOUType} from "@/types/types";

export const useIOUStore = defineStore("ious", {
  state: () => ({
    IOUs: [] as IOUType[],
  }),
  getters: {
    getIOUs(): IOUType[] {
      return this.IOUs;
    },
  },
  actions: {
    setIOUs(IOU: IOUType[]) {
      this.IOUs =IOU;
    },
    deleteIOUs() {
      this.IOUs = [];
    },
  },
});
