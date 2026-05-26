import { createContext, useContext, type PropsWithChildren } from 'react';
import type { RootStore } from './RootStore';

const RootStoreContext = createContext<RootStore | null>(null);

interface RootStoreProviderProps extends PropsWithChildren {
  store: RootStore;
}

export function RootStoreProvider({ store, children }: RootStoreProviderProps) {
  return <RootStoreContext.Provider value={store}>{children}</RootStoreContext.Provider>;
}

export function useRootStore() {
  const store = useContext(RootStoreContext);

  if (!store) {
    throw new Error('useRootStore must be used inside RootStoreProvider');
  }

  return store;
}

export function useScenarioPlayer() {
  return useRootStore().scenarioPlayer;
}
