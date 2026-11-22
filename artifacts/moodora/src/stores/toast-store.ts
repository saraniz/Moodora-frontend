import { create } from "zustand";

interface ToastStore {
  message: string;
  setMessage: (message: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  message: "",
  setMessage: (message) => set({ message }),
}));

let timer: number | undefined;

/** Shows a short message above the dock. */
export function notify(message: string) {
  window.clearTimeout(timer);
  useToastStore.getState().setMessage(message);
  timer = window.setTimeout(() => useToastStore.getState().setMessage(""), 2600);
}
