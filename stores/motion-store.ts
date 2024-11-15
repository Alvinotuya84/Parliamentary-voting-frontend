import { create } from "zustand";

interface MotionState {
  isVotingActive: boolean;
  currentSpeaker: string | null;
  setVotingActive: (active: boolean) => void;
  setCurrentSpeaker: (memberId: string | null) => void;
}

export const useMotionStore = create<MotionState>()((set) => ({
  isVotingActive: false,
  currentSpeaker: null,
  setVotingActive: (active) => set({ isVotingActive: active }),
  setCurrentSpeaker: (memberId) => set({ currentSpeaker: memberId }),
}));
