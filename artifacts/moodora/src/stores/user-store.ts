import { create } from "zustand";
import { read, remove, storageKeys, write } from "@/lib/storage";
import type { Session, User } from "@/models";

const defaultUser: User = {
  name: "Maya Chen",
  email: "maya.chen@example.com",
  avatar: "",
};

interface UserStore {
  user: User;
  updateUser: (changes: Partial<User>) => void;
  /** Starts a local session. There is no server, so the password is not kept. */
  signIn: (session: Session) => void;
  signOut: () => void;
  resetUser: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: {
    name: read(storageKeys.name, defaultUser.name),
    email: read(storageKeys.email, defaultUser.email),
    avatar: read(storageKeys.avatar, defaultUser.avatar),
  },
  updateUser: (changes) =>
    set((state) => {
      const user = { ...state.user, ...changes };
      write(storageKeys.name, user.name);
      write(storageKeys.email, user.email);
      write(storageKeys.avatar, user.avatar);
      return { user };
    }),
  signIn: (session) => {
    write(storageKeys.session, session);
    get().updateUser(session);
  },
  signOut: () => remove(storageKeys.session),
  resetUser: () => set({ user: defaultUser }),
}));
