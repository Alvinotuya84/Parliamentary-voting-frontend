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
  votedMembers: Set<string>;
  setActiveMember: (member: Member | null) => void;
  setActiveMotion: (motionId: string | null) => void;
  addVotedMember: (memberId: string) => void;
  clearVotedMembers: () => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      activeMember: null,
      activeMotionId: null,
      votedMembers: new Set<string>(),
      setActiveMember: (member) => set({ activeMember: member }),
      setActiveMotion: (motionId) => set({ activeMotionId: motionId }),
      addVotedMember: (memberId) =>
        set((state) => ({
          votedMembers: new Set([...state.votedMembers, memberId]),
          activeMember: null, // Clear active member after vote
        })),
      clearVotedMembers: () => set({ votedMembers: new Set() }),
      clearSession: () =>
        set({
          activeMember: null,
          activeMotionId: null,
          votedMembers: new Set(),
        }),
    }),
    {
      name: "parliament-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        ...state,
        votedMembers: Array.from(state.votedMembers), // Convert Set to Array for storage
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        votedMembers: new Set(persistedState.votedMembers), // Convert Array back to Set
      }),
    }
  )
);
