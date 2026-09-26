import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
HF_TOKEN = os.getenv("HF_TOKEN", "")

CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
CLOUDFLARE_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN", "")
CLOUDFLARE_AI_MODEL = os.getenv(
    "CLOUDFLARE_AI_MODEL",
    "@cf/black-forest-labs/flux-1-schnell"
)

IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY", "")
IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY", "")
IMAGEKIT_URL_ENDPOINT = os.getenv("IMAGEKIT_URL_ENDPOINT", "")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./thumbnailbuilder.db"
)

# Supabase Authentication Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# # Debugging: print what was loaded
# print("=== DEBUG: Config loaded from .env ===")
# print("SUPABASE_URL:", "Set" if SUPABASE_URL else "MISSING")
# print("SUPABASE_ANON_KEY:", "Set" if SUPABASE_ANON_KEY else "MISSING")
# print("SUPABASE_JWT_SECRET:", "Set" if SUPABASE_JWT_SECRET else "MISSING")
# print("=====================================")