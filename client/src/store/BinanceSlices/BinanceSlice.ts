import { StateCreator } from "zustand";
import axios from "axios";

type Kline = [
    number,  // Open time (timestamp)
    number,  // Close price
    number,  // High price
    number,  // Low price
    number,  // Open price
    number   // Volume
];


export type BinanceSliceType = {
    BinancehistoricalData: Kline[];
    loading: boolean;
    error: string | null;
    fetchBinanceHistoricalData: (
        symbol: string | undefined,
        interval: string,
        startTime?: string,
        endTime?: string,
        limit?: number
    ) => Promise<void>;
};

export const BinanceSlice: StateCreator<BinanceSliceType> = (set) => ({
    BinancehistoricalData: [],
    loading: false,
    error: null,

    fetchBinanceHistoricalData: async (symbol = "BinanceUSDT", interval = "1m", startTime, endTime, limit = 1000) => {
        set({ loading: true, error: null });
        try {
            const params = {
                symbol,
                interval,
                limit,
                ...(startTime && { startTime: new Date(startTime).getTime() }),
                ...(endTime && { endTime: new Date(endTime).getTime() }),
            };

            const response = await axios.get<Kline[]>("https://api.binance.com/api/v3/klines", { params });

            const simplifiedData = response.data.map(kline => ([
                kline[0],                             // timestamp (Open time, as number)
                Number(kline[1]),                     // Open (convertir a número)
                Number(kline[2]),                     // High (convertir a número)
                Number(kline[3]),                     // Low (convertir a número)
                Number(kline[4]),                     // Close (convertir a número)
                Number(kline[5]),                     // Volume (convertir a número)
            ])) as Kline[]; // tipo Kline[] asegurado

            set({ BinancehistoricalData: simplifiedData, loading: false });
        } catch (err) {
            set({ error: "Error al obtener datos históricos", loading: false });
            console.error(err);
        }
    },
});


