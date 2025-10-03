import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Activity {
  id: number;
  agent: string;
  title: string;
  timestamp: string;
  status: 'completed' | 'in-progress' | 'failed';
}

interface AppState {
  credits: number;
  userName: string;
  groqApiKey: string;
  recentActivity: Activity[];
  sharedContext: {
    marketAnalysis?: any;
    brandIdentity?: any;
  };
  setCredits: (credits: number) => void;
  deductCredit: () => boolean;
  resetCredits: () => void;
  setUserName: (name: string) => void;
  setGroqApiKey: (key: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  updateSharedContext: (key: string, value: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      credits: 50,
      userName: '',
      groqApiKey: '',
      recentActivity: [],
      sharedContext: {},

      setCredits: (credits) => set({ credits }),

      deductCredit: () => {
        const currentCredits = get().credits;
        if (currentCredits > 0) {
          set({ credits: currentCredits - 1 });
          return true;
        }
        return false;
      },

      resetCredits: () => set({ credits: 50 }),

      setUserName: (name) => set({ userName: name }),

      setGroqApiKey: (key) => set({ groqApiKey: key }),

      addActivity: (activity) =>
        set((state) => ({
          recentActivity: [
            {
              ...activity,
              id: Date.now(),
              timestamp: new Date().toISOString(),
            },
            ...state.recentActivity,
          ].slice(0, 10),
        })),

      updateSharedContext: (key, value) =>
        set((state) => ({
          sharedContext: {
            ...state.sharedContext,
            [key]: value,
          },
        })),
    }),
    {
      name: 'ai-startup-box-storage',
    }
  )
);
