import { create } from "zustand";
import { scaffoldConfig, ChainWithAttributes } from "@/utils/networks";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
  nativeCurrencyPrice: number;
  strkCurrencyPrice: number;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setStrkCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
};

export const useGlobalState = create<GlobalState>((set) => ({
  nativeCurrencyPrice: 0,
  strkCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number): void =>
    set(() => ({ nativeCurrencyPrice: newValue })),
  setStrkCurrencyPrice: (newValue: number): void =>
    set(() => ({ strkCurrencyPrice: newValue })),
  targetNetwork: scaffoldConfig.targetNetworks[0],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) =>
    set(() => ({ targetNetwork: newTargetNetwork })),
}));
