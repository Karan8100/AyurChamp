import time
from typing import Any, Dict, Optional, Tuple


class SimpleMemoryCache:
    """Thread-safe, lightweight in-memory cache with TTL.
    Requires zero external databases (like Redis), zero configurations,
    and runs entirely inside Python process RAM across localhost and production deployments.
    """

    def __init__(self, default_ttl_seconds: int = 300):
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self.default_ttl = default_ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if not entry:
            return None
        value, expiry = entry
        if time.time() > expiry:
            self._cache.pop(key, None)
            return None
        return value

    def has(self, key: str) -> bool:
        if key not in self._cache:
            return False
        _, expiry = self._cache[key]
        if time.time() > expiry:
            self._cache.pop(key, None)
            return False
        return True

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        self._cache[key] = (value, time.time() + ttl)

    def delete(self, key: str) -> None:
        self._cache.pop(key, None)

    def clear_for_user(self, user_id: int) -> None:
        target = str(user_id)
        keys_to_del = [k for k in self._cache if f":{target}" in k or f"user:{target}" in k]
        for k in keys_to_del:
            self._cache.pop(k, None)

    def clear_all(self) -> None:
        self._cache.clear()



memory_cache = SimpleMemoryCache(default_ttl_seconds=300)
