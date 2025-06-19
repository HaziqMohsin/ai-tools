"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type GeneralStore, createGeneralStore } from "@/stores/general-store";

export type GeneralStoreApi = ReturnType<typeof createGeneralStore>;

export const GeneralStoreContext = createContext<GeneralStoreApi | undefined>(
    undefined
);

export interface GeneralStoreProviderProps {
    children: ReactNode;
}

export const GeneralStoreProvider = ({
    children,
}: GeneralStoreProviderProps) => {
    const storeRef = useRef<GeneralStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createGeneralStore();
    }

    return (
        <GeneralStoreContext.Provider value={storeRef.current}>
            {children}
        </GeneralStoreContext.Provider>
    );
};

export const useGeneralStore = <T,>(
    selector: (store: GeneralStore) => T
): T => {
    const generalStoreContext = useContext(GeneralStoreContext);

    if (!generalStoreContext) {
        throw new Error(
            `useCounterStore must be used within CounterStoreProvider`
        );
    }

    return useStore(generalStoreContext, selector);
};
