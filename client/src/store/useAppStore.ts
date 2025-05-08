import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { BinanceSliceType, BinanceSlice } from './BinanceSlices/BinanceSlice'; // Importar el tipo y el slice de Binance
import { YahooFinanceSliceType, YahooFinanceSlice } from './YahooFinanceSlices/YahooFinanceSlice';


type StoreState = BinanceSliceType & YahooFinanceSliceType; // Unir los tipos de los slices

export const useAppStore = create<StoreState>()(
    devtools(
        persist(
            (...a) => ({
                ...BinanceSlice(...a), // cada slice será del tipo correspondiente
                ...YahooFinanceSlice(...a), // cada slice será del tipo correspondiente
            }),
            {
                name: 'State-storage', // nombre de la clave en sessionStorage
                storage: createJSONStorage(() => sessionStorage), // usamos sessionStorage
                partialize: () => ({
                }),
            }
        )
    ) // cada slice será del tipo correspondiente
);