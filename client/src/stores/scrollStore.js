// Enhanced Scroll Position Store with Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Enhanced scroll data structure
const createScrollData = (x = 0, y = 0, additionalData = {}) => ({
  x: Math.max(0, x),
  y: Math.max(0, y),
  timestamp: Date.now(),
  url: window.location.pathname,
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  document: {
    width: Math.max(
      document.body.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.clientWidth,
      document.documentElement.scrollWidth,
      document.documentElement.offsetWidth
    ),
    height: Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    ),
  },
  userAgent: navigator.userAgent.substring(0, 100),
  ...additionalData,
});

// Create the scroll store with persistence
export const useScrollStore = create(
  persist(
      (set, get) => ({
        // Scroll positions for different pages
        positions: {},
        
        // Filter states for different pages
        filterStates: {},
        
        // Navigation context
        navigationContext: {
          lastVisitedPage: null,
          navigationSource: 'direct',
          returnFlags: {},
        },
        
        // Restoration settings
        settings: {
          maxRetries: 5,
          retryDelay: 100,
          maxDelay: 2000,
          tolerance: 10,
          dataExpiryHours: 24,
          enableDebugLogs: process.env.NODE_ENV === 'development',
        },
        
        // Actions
        saveScrollPosition: (key, x, y, additionalData = {}) => {
          const scrollData = createScrollData(x, y, additionalData);
          
          set((state) => ({
            positions: {
              ...state.positions,
              [key]: scrollData,
            },
          }));
          
          if (get().settings.enableDebugLogs) {
            console.log(`🔄 [ScrollStore] Saved position for ${key}:`, scrollData);
          }
          
          return scrollData;
        },
        
        getScrollPosition: (key) => {
          const position = get().positions[key];
          
          if (!position) {
            return null;
          }
          
          // Check if data is stale
          const hoursOld = (Date.now() - position.timestamp) / (1000 * 60 * 60);
          if (hoursOld > get().settings.dataExpiryHours) {
            // Remove stale data
            set((state) => {
              const newPositions = { ...state.positions };
              delete newPositions[key];
              return { positions: newPositions };
            });
            
            if (get().settings.enableDebugLogs) {
              console.log(`🗑️ [ScrollStore] Removed stale data for ${key}`);
            }
            
            return null;
          }
          
          return position;
        },
        
        clearScrollPosition: (key) => {
          set((state) => {
            const newPositions = { ...state.positions };
            delete newPositions[key];
            return { positions: newPositions };
          });
          
          if (get().settings.enableDebugLogs) {
            console.log(`🗑️ [ScrollStore] Cleared position for ${key}`);
          }
        },
        
        saveFilterState: (key, filterData) => {
          const enrichedData = {
            ...filterData,
            timestamp: Date.now(),
            url: window.location.pathname,
          };
          
          set((state) => ({
            filterStates: {
              ...state.filterStates,
              [key]: enrichedData,
            },
          }));
          
          if (get().settings.enableDebugLogs) {
            console.log(`📊 [ScrollStore] Saved filter state for ${key}:`, enrichedData);
          }
        },
        
        getFilterState: (key) => {
          const filterState = get().filterStates[key];
          
          if (!filterState) {
            return null;
          }
          
          // Check if data is stale
          const hoursOld = (Date.now() - filterState.timestamp) / (1000 * 60 * 60);
          if (hoursOld > get().settings.dataExpiryHours) {
            // Remove stale data
            set((state) => {
              const newFilterStates = { ...state.filterStates };
              delete newFilterStates[key];
              return { filterStates: newFilterStates };
            });
            
            return null;
          }
          
          return filterState;
        },
        
        clearFilterState: (key) => {
          set((state) => {
            const newFilterStates = { ...state.filterStates };
            delete newFilterStates[key];
            return { filterStates: newFilterStates };
          });
        },
        
        setNavigationContext: (context) => {
          set((state) => ({
            navigationContext: {
              ...state.navigationContext,
              ...context,
            },
          }));
          
          if (get().settings.enableDebugLogs) {
            console.log(`🧭 [ScrollStore] Updated navigation context:`, context);
          }
        },
        
        setReturnFlag: (key, value = true) => {
          set((state) => ({
            navigationContext: {
              ...state.navigationContext,
              returnFlags: {
                ...state.navigationContext.returnFlags,
                [key]: value,
              },
            },
          }));
        },
        
        getReturnFlag: (key) => {
          return get().navigationContext.returnFlags[key] || false;
        },
        
        clearReturnFlag: (key) => {
          set((state) => {
            const newReturnFlags = { ...state.navigationContext.returnFlags };
            delete newReturnFlags[key];
            return {
              navigationContext: {
                ...state.navigationContext,
                returnFlags: newReturnFlags,
              },
            };
          });
        },
        
        updateSettings: (newSettings) => {
          set((state) => ({
            settings: {
              ...state.settings,
              ...newSettings,
            },
          }));
        },
        
        // Cleanup old data
        cleanup: () => {
          const now = Date.now();
          const expiryTime = get().settings.dataExpiryHours * 60 * 60 * 1000;
          
          set((state) => {
            const newPositions = {};
            const newFilterStates = {};
            
            // Filter out expired positions
            Object.entries(state.positions).forEach(([key, data]) => {
              if (now - data.timestamp < expiryTime) {
                newPositions[key] = data;
              }
            });
            
            // Filter out expired filter states
            Object.entries(state.filterStates).forEach(([key, data]) => {
              if (now - data.timestamp < expiryTime) {
                newFilterStates[key] = data;
              }
            });
            
            return {
              positions: newPositions,
              filterStates: newFilterStates,
            };
          });
          
          if (get().settings.enableDebugLogs) {
            console.log(`🧹 [ScrollStore] Cleanup completed`);
          }
        },
        
        // Debug methods
        getDebugInfo: () => {
          const state = get();
          return {
            positionKeys: Object.keys(state.positions),
            filterStateKeys: Object.keys(state.filterStates),
            navigationContext: state.navigationContext,
            settings: state.settings,
            dataAge: Object.entries(state.positions).map(([key, data]) => ({
              key,
              ageHours: (Date.now() - data.timestamp) / (1000 * 60 * 60),
            })),
          };
        },
        
        reset: () => {
          set({
            positions: {},
            filterStates: {},
            navigationContext: {
              lastVisitedPage: null,
              navigationSource: 'direct',
              returnFlags: {},
            },
          });
          
          console.log(`🔄 [ScrollStore] Store reset`);
        },
      }),
      {
        name: 'scroll-position-store',
        storage: createJSONStorage(() => {
          // Try sessionStorage first, fallback to localStorage, then memory
          try {
            return sessionStorage;
          } catch {
            try {
              return localStorage;
            } catch {
              // Memory storage fallback
              const memoryStorage = {};
              return {
                getItem: (key) => memoryStorage[key] || null,
                setItem: (key, value) => { memoryStorage[key] = value; },
                removeItem: (key) => { delete memoryStorage[key]; },
              };
            }
          }
        }),
        partialize: (state) => ({
          positions: state.positions,
          filterStates: state.filterStates,
          navigationContext: state.navigationContext,
        }),
        onRehydrateStorage: () => (state) => {
          if (state && state.settings?.enableDebugLogs) {
            console.log('🔄 [ScrollStore] Rehydrated from storage');
          }
          // Skip cleanup on rehydration to prevent loops
        },
      }
    )
);

// Selector hooks for better performance
export const useScrollPosition = (key) =>
  useScrollStore((state) => state.getScrollPosition(key));

export const useFilterState = (key) =>
  useScrollStore((state) => state.getFilterState(key));

export const useNavigationContext = () =>
  useScrollStore((state) => state.navigationContext);

export const useScrollSettings = () =>
  useScrollStore((state) => state.settings);

// Action hooks
export const useScrollActions = () =>
  useScrollStore((state) => ({
    saveScrollPosition: state.saveScrollPosition,
    clearScrollPosition: state.clearScrollPosition,
    saveFilterState: state.saveFilterState,
    clearFilterState: state.clearFilterState,
    setNavigationContext: state.setNavigationContext,
    setReturnFlag: state.setReturnFlag,
    getReturnFlag: state.getReturnFlag,
    clearReturnFlag: state.clearReturnFlag,
    cleanup: state.cleanup,
    reset: state.reset,
  }));

export default useScrollStore;