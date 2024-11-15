import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Member {
  id: string;
  name: string;
  constituency: string;
  role: string;
}

interface SessionState {
  activeMember: Member | null;
  activeMotionId: string | null;
  setActiveMember: (member: Member | null) => void;
  setActiveMotion: (motionId: string | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      activeMember: null,
      activeMotionId: null,
      setActiveMember: (member) => set({ activeMember: member }),
      setActiveMotion: (motionId) => set({ activeMotionId: motionId }),
      clearSession: () => set({ activeMember: null, activeMotionId: null }),
    }),
    {
      name: "parliament-session",
      storage: createJSONStorage(() => sessionStorage), // Using sessionStorage instead of localStorage
    }
  )
);
