"""Knowledge Ingestion Script (MVP Step 1B)

Reads markdown/text files from a directory, chunks them by paragraphs,
generates embeddings using llm_client.embed_text(), and stores them in the
KnowledgeChunk table with pgvector vector columns.

Usage:
    uv run python -m scripts.ingest_knowledge
    uv run python scripts/ingest_knowledge.py --dir app/data/knowledge_base
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from sqlmodel import SQLModel
from app.db.session import async_session, engine
from app.models import KnowledgeChunk
from app.services.llm_client import embed_text


def infer_category_and_source(file_path: Path) -> tuple[str, str]:
    """Infers category ('diet' | 'lifestyle' | 'herb' | 'general') and source key from filename."""
    stem = file_path.stem.lower()
    source = stem
    
    if "diet" in stem or "food" in stem or "meal" in stem:
        category = "diet"
    elif "lifestyle" in stem or "ritu" in stem or "vihar" in stem or "dinacharya" in stem:
        category = "lifestyle"
    elif "herb" in stem or "aushadhi" in stem or "dravya" in stem:
        category = "herb"
    else:
        category = "general"
        
    return category, source


def chunk_text(content: str) -> list[str]:
    """Splits text into non-empty paragraphs."""
    raw_paragraphs = content.split("\n\n")
    cleaned = []
    for p in raw_paragraphs:
        stripped = p.strip()
        # Skip purely markdown heading lines with no text or very short headers
        if stripped and not stripped.startswith("# ") and len(stripped) > 20:
            cleaned.append(stripped)
        elif stripped and len(stripped) > 40:
            cleaned.append(stripped)
    return cleaned


async def ingest_directory(dir_path: Path, clean: bool = False):
    """Ingests all markdown, text, and json files from the specified directory."""
    if not dir_path.exists():
        print(f"Directory not found: {dir_path}")
        return

    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    if clean:
        print("[clean=True] Clearing existing knowledgechunk records before re-ingestion...")
        from sqlmodel import delete
        async with async_session() as session:
            await session.exec(delete(KnowledgeChunk))
            await session.commit()
        print("Cleared existing chunks successfully.")

    # Support .json, .md, and .txt files
    json_files = list(dir_path.glob("**/*.json"))
    md_files = list(dir_path.glob("**/*.md"))
    txt_files = list(dir_path.glob("**/*.txt"))
    all_files = json_files + md_files + txt_files
    print(f"Found {len(all_files)} files ({len(json_files)} JSON, {len(md_files)} MD, {len(txt_files)} TXT) to ingest from {dir_path}")

    import json
    from sqlmodel import select

    total_chunks = 0
    skipped_chunks = 0

    async with async_session() as session:
        # 1. Process JSON files (structured knowledge chunks)
        for jf in json_files:
            try:
                data = json.loads(jf.read_text(encoding="utf-8"))
                if isinstance(data, list):
                    print(f"Processing JSON '{jf.name}' -> {len(data)} items")
                    for item in data:
                        content_body = item.get("content", "").strip()
                        title = item.get("title", "")
                        source = item.get("source", jf.stem)
                        category = item.get("category", "diet")
                        
                        full_content = f"[{title}] (Source: {source})\n{content_body}"
                        
                        # Deduplication check if not clean
                        if not clean:
                            existing = await session.exec(
                                select(KnowledgeChunk).where(KnowledgeChunk.content == full_content)
                            )
                            if existing.first():
                                skipped_chunks += 1
                                continue
                            
                        embedding = await embed_text(full_content)
                        chunk_record = KnowledgeChunk(
                            content=full_content,
                            source=source,
                            category=category,
                            embedding=embedding,
                        )
                        session.add(chunk_record)
                        total_chunks += 1
                        if total_chunks % 5 == 0:
                            print(f"  Ingested {total_chunks} chunks...")
                        await asyncio.sleep(0.15)
            except Exception as e:
                print(f"Error reading JSON {jf.name}: {e}")

        # 2. Process MD and TXT files (paragraph chunks)
        for file_path in md_files + txt_files:
            category, source = infer_category_and_source(file_path)
            content = file_path.read_text(encoding="utf-8")
            chunks = chunk_text(content)
            
            print(f"Processing '{file_path.name}' -> category: '{category}', chunks: {len(chunks)}")
            
            for chunk_content in chunks:
                if not clean:
                    existing = await session.exec(
                        select(KnowledgeChunk).where(KnowledgeChunk.content == chunk_content)
                    )
                    if existing.first():
                        skipped_chunks += 1
                        continue
                    
                embedding = await embed_text(chunk_content)
                chunk_record = KnowledgeChunk(
                    content=chunk_content,
                    source=source,
                    category=category,
                    embedding=embedding,
                )
                session.add(chunk_record)
                total_chunks += 1
                if total_chunks % 5 == 0:
                    print(f"  Ingested {total_chunks} chunks...")
                await asyncio.sleep(0.15)

        await session.commit()
    
    print(f"Done! Successfully ingested {total_chunks} knowledge chunks (Skipped {skipped_chunks} existing).")


def main():
    parser = argparse.ArgumentParser(description="Ingest knowledge files into pgvector")
    parser.add_argument(
        "--dir",
        type=str,
        default=str(backend_root / "app" / "data" / "knowledge_base"),
        help="Path to directory containing .json, .md, or .txt files",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Clear existing knowledge chunks before re-embedding (useful when adding new API key)",
    )
    args = parser.parse_args()
    target_dir = Path(args.dir)

    asyncio.run(ingest_directory(target_dir, clean=args.clean))


if __name__ == "__main__":
    main()
