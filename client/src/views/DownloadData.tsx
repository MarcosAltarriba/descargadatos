import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppStore } from '../store/useAppStore';
import { assetOptions, periodOptions, intervalOptions } from '../types/AssetsTypes';

const DownloadDataView = () => {
    const { fetchBinanceHistoricalData, fetchYahooFinanceData } = useAppStore();

    const [formData, setFormData] = useState({
        selectedAssets: [] as string[],
        interval: '1d',
        period: '1y'
    });

    const [expandedSections, setExpandedSections] = useState({
        crypto: true,
        stocks: true
    });

    const [searchTerms, setSearchTerms] = useState({
        crypto: '',
        stocks: ''
    });

    const cryptoAssets = assetOptions
        .filter(asset => asset.type === 'crypto')
        .filter(asset =>
            asset.label.toLowerCase().includes(searchTerms.crypto.toLowerCase()) ||
            asset.symbol?.toLowerCase().includes(searchTerms.crypto.toLowerCase())
        );

    const stockAssets = assetOptions
        .filter(asset => asset.type === 'stock')
        .filter(asset =>
            asset.label.toLowerCase().includes(searchTerms.stocks.toLowerCase()) ||
            asset.symbol?.toLowerCase().includes(searchTerms.stocks.toLowerCase())
        );

    const toggleSection = (section: 'crypto' | 'stocks') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>, section: 'crypto' | 'stocks') => {
        setSearchTerms(prev => ({
            ...prev,
            [section]: e.target.value
        }));
    };

    const handleAssetChange = (assetId: string) => {
        setFormData(prev => {
            if (prev.selectedAssets.includes(assetId)) {
                return {
                    ...prev,
                    selectedAssets: prev.selectedAssets.filter(id => id !== assetId)
                };
            } else {
                return {
                    ...prev,
                    selectedAssets: [...prev.selectedAssets, assetId]
                };
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDownload = async () => {
        try {
            if (formData.selectedAssets.length === 0) {
                toast.warn('Selecciona al menos un activo');
                return;
            }

            const allData: Record<string, any[]> = {};

            const selectedCryptoAssets = formData.selectedAssets.filter(id => {
                const asset = assetOptions.find(a => a.id === id);
                return asset?.type === 'crypto';
            });

            const selectedStockAssets = formData.selectedAssets.filter(id => {
                const asset = assetOptions.find(a => a.id === id);
                return asset?.type === 'stock';
            });

            toast.info('La descarga se ha iniciado, por favor espera...');

            for (const assetId of selectedCryptoAssets) {
                const asset = assetOptions.find(a => a.id === assetId);
                if (!asset) continue;

                await fetchBinanceHistoricalData(
                    asset.symbol,
                    formData.interval,
                    undefined,
                    undefined,
                    1000
                );

                const currentState = useAppStore.getState();
                allData[assetId] = [...currentState.BinancehistoricalData];
            }

            if (selectedStockAssets.length > 0) {
                const stockData = await fetchYahooFinanceData(
                    selectedStockAssets,
                    formData.period,
                    formData.interval
                );
                Object.assign(allData, stockData);
            }

            const hasData = Object.values(allData).some(
                data => data && data.length > 0
            );

            if (!hasData) {
                throw new Error("No se pudieron cargar los datos históricos.");
            }

            // Convertir a formato CSV
            const csvRows: string[] = [];
            // columnas del CSV
            csvRows.push("asset,timestamp,close,high,low,open,volume");

            for (const [assetId, records] of Object.entries(allData)) {
                for (const entry of records) {
                    if (!Array.isArray(entry) || entry.length < 6) continue;
                    const [timestamp, close, high, low, open, volume] = entry;
                    const row = [
                        assetId,
                        timestamp,
                        close,
                        high,
                        low,
                        open,
                        volume
                    ];
                    csvRows.push(row.join(","));
                }
            }


            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], {
                type: 'text/csv;charset=utf-8;'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `datos_historicos_${formData.selectedAssets.join('_')}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success(`Datos descargados para: ${formData.selectedAssets.join(', ')}`);
        } catch (error) {
            toast.error('Error al descargar los datos');
            console.error(error);
        }
    };


    return (
        <main className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-gray-100 min-h-screen flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Configurar Descarga de Datos</h1>

                <div className="space-y-4">
                    {/* Acordeón de Criptomonedas */}
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <button
                            onClick={() => toggleSection('crypto')}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex justify-between items-center"
                        >
                            <h2 className="text-lg font-medium text-gray-700">Criptomonedas</h2>
                            <svg
                                className={`w-5 h-5 transform transition-transform ${expandedSections.crypto ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedSections.crypto && (
                            <div className="p-4 space-y-3">
                                {/* Buscador de Criptomonedas */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar cripto por nombre o símbolo..."
                                        value={searchTerms.crypto}
                                        onChange={(e) => handleSearchChange(e, 'crypto')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    {searchTerms.crypto && (
                                        <button
                                            onClick={() => setSearchTerms(prev => ({ ...prev, crypto: '' }))}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Lista de Criptomonedas */}
                                {cryptoAssets.length > 0 ? (
                                    cryptoAssets.map((asset) => (
                                        <div key={asset.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`crypto-${asset.id}`}
                                                checked={formData.selectedAssets.includes(asset.id)}
                                                onChange={() => handleAssetChange(asset.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`crypto-${asset.id}`} className="ml-2 block text-sm text-gray-700">
                                                {asset.label}{asset.symbol && ` (${asset.symbol})`}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-2">No hay resultados</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Acordeón de Acciones */}
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <button
                            onClick={() => toggleSection('stocks')}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex justify-between items-center"
                        >
                            <h2 className="text-lg font-medium text-gray-700">Acciones</h2>
                            <svg
                                className={`w-5 h-5 transform transition-transform ${expandedSections.stocks ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedSections.stocks && (
                            <div className="p-4 space-y-3">
                                {/* Buscador de Acciones */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar acciones por nombre o símbolo..."
                                        value={searchTerms.stocks}
                                        onChange={(e) => handleSearchChange(e, 'stocks')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    {searchTerms.stocks && (
                                        <button
                                            onClick={() => setSearchTerms(prev => ({ ...prev, stocks: '' }))}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Lista de Acciones */}
                                {stockAssets.length > 0 ? (
                                    stockAssets.map((asset) => (
                                        <div key={asset.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`stock-${asset.id}`}
                                                checked={formData.selectedAssets.includes(asset.id)}
                                                onChange={() => handleAssetChange(asset.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`stock-${asset.id}`} className="ml-2 block text-sm text-gray-700">
                                                {asset.label}{asset.symbol && ` (${asset.symbol})`}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-2">No hay resultados</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selectores de Periodo e Intervalo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                            <select
                                name="period"
                                value={formData.period}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                {periodOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo</label>
                            <select
                                name="interval"
                                value={formData.interval}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                {intervalOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Botón de Descarga */}
                    <button
                        onClick={handleDownload}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                    >
                        Descargar Datos
                    </button>
                </div>
            </div>
        </main>
    );
};

export default DownloadDataView;