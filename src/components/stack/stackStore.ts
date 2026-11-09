import { useSyncExternalStore } from 'react';

/**
 * Shared state for the seven-layer stack, framework-free so the hero rail, the
 * 3D scene and the static SVG can all read and write it without a provider.
 *
 * - hover:       layer under the pointer (rail label or slab), -1 for none
 * - activeLayer: layer pinned by a parent (e.g. a scroll section), -1 for none
 * - explode:     0 = packed stack, 1 = fully exploded
 */
export interface StackState {
  hover: number;
  activeLayer: number;
  explode: number;
}

export interface StackStore {
  get(): StackState;
  set(patch: Partial<StackState>): void;
  subscribe(listener: () => void): () => void;
}

export function createStackStore(initial: Partial<StackState> = {}): StackStore {
  let state: StackState = { hover: -1, activeLayer: -1, explode: 0, ...initial };
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(patch) {
      let changed = false;
      for (const key in patch) {
        const k = key as keyof StackState;
        if (patch[k] !== undefined && patch[k] !== state[k]) changed = true;
      }
      if (!changed) return;
      state = { ...state, ...patch };
      listeners.forEach((fn) => fn());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** The hero's instance: rail labels and the hero scene share it. */
export const heroStackStore = createStackStore();

export function useStackStore<T>(store: StackStore, select: (state: StackState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => select(store.get()),
    () => select(store.get()),
  );
}

/** Layer i is lit when it is hovered or pinned active. */
export function isLit(state: Pick<StackState, 'hover' | 'activeLayer'>, i: number) {
  return state.hover === i || state.activeLayer === i;
}
