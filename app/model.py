from transformers import pipeline

generator = pipeline("text-generation", model="distilgpt2")

def generate_text(prompt: str):
    result = generator(prompt, max_length=50, num_return_sequences=1)
    return result[0]["generated_text"]