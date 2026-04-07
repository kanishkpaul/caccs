import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration (defaults to SQLite for easy setup)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./caccs.db")

# Fallback API values
DEFAULT_OPENROUTER_MODEL = "google/gemini-2.0-flash-001"
