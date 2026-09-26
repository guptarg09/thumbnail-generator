import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
HF_TOKEN = os.getenv("HF_TOKEN", "")

IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY", "")
IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY", "")
IMAGEKIT_URL_ENDPOINT = os.getenv("IMAGEKIT_URL_ENDPOINT", "")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./thumbnailbuilder.db"
)