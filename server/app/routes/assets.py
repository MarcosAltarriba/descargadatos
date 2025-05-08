import json
from fastapi import APIRouter
from fastapi.responses import ORJSONResponse
from models.assets_request import AssetRequest
import yfinance as yf

router = APIRouter(
    prefix="/PyAssetsAPI",
    tags=["API"]
)

@router.post("/download_data", response_class=ORJSONResponse)
def download_data(req: AssetRequest):
    result = {}
    for ticker in req.tickers:
        try:
            data = yf.download(ticker, period=req.period, interval=req.interval)
            
            # Asegurarse de que el índice sea de tipo datetime
            data.index = data.index.tz_localize(None)
            
            # Convertir a timestamps
            timestamps = (data.index.astype('int64') // 10**6).tolist()
            values = data[['Close', 'High', 'Low', 'Open', 'Volume']].values.tolist()
            
            # Combinar timestamp + valores
            combined = [[ts] + val for ts, val in zip(timestamps, values)]
            
            result[str(ticker)] = combined
            print(f"Data for {ticker} downloaded successfully.")
        except Exception as e:
            result[str(ticker)] = {"error": str(e)}
    return result
