import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AISettings {
  provider: 'openai' | 'gemini' | 'mock';
  apiKey: string;
  autoProcess: boolean;
  confidenceThreshold: number;
}

interface AIStore {
  settings: AISettings;
  isProcessing: boolean;
  lastProcessedResult: any | null;
  updateSettings: (settings: Partial<AISettings>) => void;
  setProcessing: (processing: boolean) => void;
  setLastResult: (result: any) => void;
  clearApiKey: () => void;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      settings: {
        provider: 'mock', // Default to mock for demo
        apiKey: '',
        autoProcess: true,
        confidenceThreshold: 0.7
      },
      isProcessing: false,
      lastProcessedResult: null,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setProcessing: (processing) => {
        set({ isProcessing: processing });
      },

      setLastResult: (result) => {
        set({ lastProcessedResult: result });
      },

      clearApiKey: () => {
        set((state) => ({
          settings: { ...state.settings, apiKey: '' }
        }));
      }
    }),
    {
      name: 'ai-settings-storage',
      // Don't persist API keys for security
      partialize: (state) => ({
        settings: {
          ...state.settings,
          apiKey: '' // Never persist API keys
        }
      })
    }
  )
);