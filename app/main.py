from fastapi import FastAPI
from api.routes import router

app = FastAPI(title="LLM API", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(router)