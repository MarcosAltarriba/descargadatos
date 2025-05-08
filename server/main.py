from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from app.routes.assets import router


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(router) 

if __name__ == "__main__":
    uvicorn.run("main:app", port = 8000, reload=True)