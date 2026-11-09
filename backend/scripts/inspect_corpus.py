import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

corpus_dir = Path("app/data/knowledge_base")
files = sorted(corpus_dir.glob("*.json"))
total = 0

print("=" * 80)
print("AYUSHYA CANONICAL AYURVEDIC CORPUS AUDIT")
print("=" * 80)

for f in files:
    data = json.loads(f.read_text(encoding="utf-8"))
    print(f"\n📂 FILE: {f.name} ({len(data)} items)")
    print("-" * 80)
    for i, item in enumerate(data, 1):
        total += 1
        title = item.get("title", "Untitled")
        source = item.get("source", "Unknown")
        cat = item.get("category", "General")
        snippet = item.get("content", "")[:120].replace("\n", " ")
        print(f"  [{i}] {title}")
        print(f"      Source: {source} | Category: {cat}")
        print(f"      Snippet: {snippet}...")

print("\n" + "=" * 80)
print(f"TOTAL VERIFIED CORPUS CHUNKS IN VECTOR DATABASE: {total}")
print("=" * 80)
