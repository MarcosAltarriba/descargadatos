from pydantic import BaseModel
from typing import List

class AssetRequest(BaseModel):
    tickers: List[str]
    period: str = "5y"
    interval: str = "1d"
