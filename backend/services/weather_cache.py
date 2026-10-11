"""
Weather In-Memory Cache Service
===============================
Thread-safe TTL caching for meteorological API responses.
Respects rate limits, upstream expiry headers, and configured refresh intervals.
"""

import time
import threading
from typing import Dict, Any, Optional


class WeatherCache:
    """
    In-memory thread-safe key-value cache with time-to-live expiration.
    """

    def __init__(self, default_ttl_seconds: int = 60):
        self._default_ttl = default_ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._cache.get(key)
            if not entry:
                return None

            now = time.time()
            if now > entry["expires_at"]:
                del self._cache[key]
                return None

            return entry["data"]

    def set(self, key: str, data: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl
        expires_at = time.time() + max(1, ttl)

        with self._lock:
            self._cache[key] = {
                "data": data,
                "expires_at": expires_at,
                "cached_at": time.time()
            }

    def invalidate(self, key: str) -> None:
        with self._lock:
            self._cache.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()


# Global singleton cache instance
weather_cache = WeatherCache(default_ttl_seconds=60)
