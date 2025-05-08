import { StateCreator } from "zustand";

type CleanKline = [
    number, // Open time (FORMATO TIMESTAMP)
    number, // Close
    number, // High
    number, // Low
    number, // Open
    number  // Volume
];

type YahooFinanceAPIResponse = {
    [ticker: string]: CleanKline[];
};

export type YahooFinanceSliceType = {
    loading: boolean;
    error: string | null;
    fetchYahooFinanceData: (
        tickers: string[],
        period: string,
        interval: string,
    ) => Promise<YahooFinanceAPIResponse>;
};

export const YahooFinanceSlice: StateCreator<YahooFinanceSliceType> = (set) => ({
    loading: false,
    error: null,

    fetchYahooFinanceData: async (tickers, period, interval) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`http://localhost:8000/PyAssetsAPI/download_data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickers, period, interval })
            });

            const data: YahooFinanceAPIResponse = await response.json();

            set({ loading: false });
            console.log("Datos históricos obtenidos:", data);
            return data;
        } catch (err) {
            const errorMessage = "Error al obtener datos históricos";
            set({
                error: errorMessage,
                loading: false
            });
            console.error(err);
            throw new Error(errorMessage);
        }
    },
});