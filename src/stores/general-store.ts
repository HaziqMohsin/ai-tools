import { createStore } from "zustand/vanilla";

export type GeneralState = {
    modelCapabilities: string;
};

export type GeneralActions = {
    setModelCapabilities: () => void;
};

export type GeneralStore = GeneralState & GeneralActions;

export const defaultInitState: GeneralState = {
    modelCapabilities: "chat",
};

export const createGeneralStore = (
    initState: GeneralState = defaultInitState
) => {
    return createStore<GeneralStore>()((set) => ({
        ...initState,
        setModelCapabilities: () =>
            set((state) => ({ modelCapabilities: state.modelCapabilities })),
    }));
};
