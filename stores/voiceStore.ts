import { create } from "zustand";
import type { AssessmentResult, AudioError, VoiceSessionState } from "@/types/voice";

interface VoiceState {
  sessionState: VoiceSessionState;
  attemptId: string | null;
  audioObjectUrl: string | null; // for playback after recording
  assessmentResult: AssessmentResult | null;
  error: AudioError | null;
  durationMs: number;
}

interface VoiceActions {
  setSessionState: (state: VoiceSessionState) => void;
  setAttemptId: (id: string) => void;
  setAudioObjectUrl: (url: string | null) => void;
  setAssessmentResult: (result: AssessmentResult) => void;
  setError: (error: AudioError) => void;
  setDuration: (ms: number) => void;
  reset: () => void;
}

const initialState: VoiceState = {
  sessionState: "idle",
  attemptId: null,
  audioObjectUrl: null,
  assessmentResult: null,
  error: null,
  durationMs: 0,
};

export const useVoiceStore = create<VoiceState & VoiceActions>((set) => ({
  ...initialState,
  setSessionState: (sessionState) => set({ sessionState }),
  setAttemptId: (attemptId) => set({ attemptId }),
  setAudioObjectUrl: (audioObjectUrl) => set({ audioObjectUrl }),
  setAssessmentResult: (assessmentResult) => set({ assessmentResult, sessionState: "completed" }),
  setError: (error) => set({ error, sessionState: "error" }),
  setDuration: (durationMs) => set({ durationMs }),
  reset: () => set(initialState),
}));
