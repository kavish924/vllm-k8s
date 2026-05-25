from fastapi import APIRouter
from app.model import generate_text

router = APIRouter()

@router.get("/generate")
def generate(prompt: str):
    output = generate_text(prompt)
    return {"response": output}