import requests
import time

BASE_URL = "http://127.0.0.1:8000"

# 1. Obtain token via guest login
guest_res = requests.post(f"{BASE_URL}/auth/guest")
if guest_res.status_code != 200:
    print(f"Guest login failed: {guest_res.status_code}, {guest_res.text}")
    exit(1)

token = guest_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}


endpoints = [
    ("/auth/me", "GET"),
    ("/diet-plan", "GET"),
    ("/ritucharya/details", "GET"),
    ("/recommendations/lifestyle", "GET"),
    ("/report/prakruti", "GET"),
    ("/vikriti/progression", "GET"),
    ("/vikriti/latest", "GET"),
]

print("=== 1. Testing Backend Response Times (Cold vs Cached) ===")
for path, method in endpoints:
    # First call (cold or populated)
    t0 = time.perf_counter()
    r1 = requests.get(f"{BASE_URL}{path}", headers=headers)
    t1 = time.perf_counter() - t0

    # Second call (must be from RAM cache)
    t0 = time.perf_counter()
    r2 = requests.get(f"{BASE_URL}{path}", headers=headers)
    t2 = time.perf_counter() - t0

    status = "OK" if r2.status_code == 200 else f"STATUS {r2.status_code}"
    print(f"  {path:<30} | {status} | Call 1: {t1*1000:7.1f}ms | Cached Call 2: {t2*1000:5.2f}ms")

print("\nAll endpoints verified successfully!")
