import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Driver, Constructor } from '@shared/types';
export const TOTAL_BUDGET = 100.0;
export const MAX_DRIVERS = 5;
export const MAX_CONSTRUCTORS = 2;
interface DraftResult {
  success: boolean;
  message: string;
}
interface DraftState {
  draftedDrivers: Driver[];
  draftedConstructors: Constructor[];
  addDriver: (driver: Driver) => DraftResult;
  removeDriver: (driverId: number) => void;
  isDriverDrafted: (driverId: number) => boolean;
  addConstructor: (constructor: Constructor) => DraftResult;
  removeConstructor: (constructorId: number) => void;
  isConstructorDrafted: (constructorId: number) => boolean;
  reorderDrivers: (sourceIndex: number, destinationIndex: number) => void;
  clearDraft: () => void;
  totalCost: () => number;
  remainingBudget: () => number;
}
export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      draftedDrivers: [],
      draftedConstructors: [],
      totalCost: () => {
        const { draftedDrivers, draftedConstructors } = get();
        const driversCost = draftedDrivers.reduce((sum, d) => sum + d.price, 0);
        const constructorsCost = draftedConstructors.reduce((sum, c) => sum + c.price, 0);
        return driversCost + constructorsCost;
      },
      remainingBudget: () => {
        return TOTAL_BUDGET - get().totalCost();
      },
      addDriver: (driver) => {
        const { draftedDrivers, isDriverDrafted, remainingBudget } = get();
        if (isDriverDrafted(driver.id)) {
          return { success: false, message: `${driver.name} is already in your draft.` };
        }
        if (draftedDrivers.length >= MAX_DRIVERS) {
          return { success: false, message: `You can only have ${MAX_DRIVERS} drivers.` };
        }
        if (remainingBudget() < driver.price) {
          return { success: false, message: 'Not enough budget to draft this driver.' };
        }
        set((state) => ({ draftedDrivers: [...state.draftedDrivers, driver] }));
        return { success: true, message: `${driver.name} added to your draft!` };
      },
      removeDriver: (driverId) =>
        set((state) => ({
          draftedDrivers: state.draftedDrivers.filter((d) => d.id !== driverId),
        })),
      isDriverDrafted: (driverId) => {
        return get().draftedDrivers.some((d) => d.id === driverId);
      },
      addConstructor: (constructor) => {
        const { draftedConstructors, isConstructorDrafted, remainingBudget } = get();
        if (isConstructorDrafted(constructor.id)) {
          return { success: false, message: `${constructor.name} is already in your draft.` };
        }
        if (draftedConstructors.length >= MAX_CONSTRUCTORS) {
          return { success: false, message: `You can only have ${MAX_CONSTRUCTORS} constructors.` };
        }
        if (remainingBudget() < constructor.price) {
          return { success: false, message: 'Not enough budget to draft this constructor.' };
        }
        set((state) => ({ draftedConstructors: [...state.draftedConstructors, constructor] }));
        return { success: true, message: `${constructor.name} added to your draft!` };
      },
      removeConstructor: (constructorId) =>
        set((state) => ({
          draftedConstructors: state.draftedConstructors.filter((c) => c.id !== constructorId),
        })),
      isConstructorDrafted: (constructorId) => {
        return get().draftedConstructors.some((c) => c.id === constructorId);
      },
      reorderDrivers: (sourceIndex, destinationIndex) =>
        set((state) => {
          const newDrivers = Array.from(state.draftedDrivers);
          const [removed] = newDrivers.splice(sourceIndex, 1);
          newDrivers.splice(destinationIndex, 0, removed);
          return { draftedDrivers: newDrivers };
        }),
      clearDraft: () => set({ draftedDrivers: [], draftedConstructors: [] }),
    }),
    {
      name: 'apexdraft-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);