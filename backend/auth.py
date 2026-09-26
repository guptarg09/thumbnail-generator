import logging
import time
from typing import Optional, Dict, Any
import httpx
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

import config

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

# In-memory cache for validated tokens: token_hash -> (AuthUser, expiry_timestamp)
# Caches validation results for up to 60 seconds to optimize performance while respecting expiry
_TOKEN_CACHE: Dict[str, tuple] = {}
CACHE_TTL_SECONDS = 60

class AuthUser(BaseModel):
    id: str
    email: Optional[str] = None
    user_metadata: Dict[str, Any] = {}

def _get_cached_user(token: str) -> Optional[AuthUser]:
    cached = _TOKEN_CACHE.get(token)
    if cached:
        user, expires_at = cached
        if time.time() < expires_at:
            return user
        else:
            del _TOKEN_CACHE[token]
    return None

def _cache_user(token: str, user: AuthUser, ttl: int = CACHE_TTL_SECONDS):
    # Keep cache from growing unbounded
    if len(_TOKEN_CACHE) > 500:
        now = time.time()
        expired = [k for k, (_, exp) in _TOKEN_CACHE.items() if exp <= now]
        for k in expired:
            _TOKEN_CACHE.pop(k, None)
    _TOKEN_CACHE[token] = (user, time.time() + ttl)


async def verify_supabase_token(token: str) -> AuthUser:
    """
    Validate a Supabase JWT token.
    1. Check short-lived in-memory cache.
    2. Try local JWT decode if config.SUPABASE_JWT_SECRET is configured.
    3. Verify via Supabase Auth API if config.SUPABASE_URL is configured.
    """
    cached_user = _get_cached_user(token)
    if cached_user:
        return cached_user

    jwt_secret = config.SUPABASE_JWT_SECRET
    supabase_url = config.SUPABASE_URL
    supabase_anon_key = config.SUPABASE_ANON_KEY

    # 1. Local JWT verification if SUPABASE_JWT_SECRET is present
    if jwt_secret:
        try:
            # Supabase tokens typically have audience "authenticated"
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False, "verify_exp": True}
            )
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing subject claim",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            user = AuthUser(
                id=user_id,
                email=payload.get("email"),
                user_metadata=payload.get("user_metadata", {})
            )
            _cache_user(token, user)
            return user
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Your session has expired. Please sign in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.PyJWTError as e:
            logger.warning(f"Local JWT verification failed: {type(e).__name__}")
            if not supabase_url:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token",
                    headers={"WWW-Authenticate": "Bearer"},
                )

    # 2. Remote verification via Supabase Auth API
    if supabase_url:
        clean_url = supabase_url.rstrip("/")
        user_endpoint = f"{clean_url}/auth/v1/user"
        headers = {
            "Authorization": f"Bearer {token}",
        }
        if supabase_anon_key:
            headers["apikey"] = supabase_anon_key

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(user_endpoint, headers=headers)

            if response.status_code == 200:
                data = response.json()
                user_id = data.get("id")
                if not user_id:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token response from Supabase",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                user = AuthUser(
                    id=user_id,
                    email=data.get("email"),
                    user_metadata=data.get("user_metadata", {})
                )
                _cache_user(token, user)
                return user
            elif response.status_code in (400, 401, 403):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired authentication token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                logger.error(f"Supabase auth check failed with status {response.status_code}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not verify authentication credentials with Supabase",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except httpx.RequestError as e:
            logger.error(f"Network error connecting to Supabase auth: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to connect to authentication server. Please try again.",
            )

    # 3. Fallback: Neither secret nor url configured
    logger.error("Neither SUPABASE_URL nor SUPABASE_JWT_SECRET configured on backend")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication is required but not yet configured. Please set SUPABASE_URL or SUPABASE_JWT_SECRET in .env",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> AuthUser:
    """
    FastAPI dependency to extract and verify the Supabase access token
    from the Authorization: Bearer <token> header.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials.strip()
    return await verify_supabase_token(token)
