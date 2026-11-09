from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./prakruti.db"
    secret_key: str = "ayushya_dev_secret_key_2026_super_secure"
    environment: str = "development"
    db_ssl_required: bool = False  # set True for Neon/Supabase/any cloud Postgres
    resend_api_key: str = ""  # Resend.com API key for transactional emails

    # LLM & Embedding Settings (Step 1B RAG Infrastructure)
    embedding_provider: str = "gemini"  # "gemini" | "openai" | "ollama" | "mock"
    embedding_model: str = "gemini-embedding-001"
    embedding_dimension: int = 1536
    llm_provider: str = "gemini"  # "gemini" | "groq" | "openai" | "ollama" | "mock"
    llm_fast_model: str = "gemini-3.8-flash"
    llm_quality_model: str = "gemini-3-pro"
    groq_fast_model: str = "openai/gpt-oss-20b"
    groq_quality_model: str = "openai/gpt-oss-120b"
    openai_api_key: str = ""
    gemini_api_key: str = ""
    groq_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"

    # Cloudinary Image Upload
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    model_config = SettingsConfigDict(
        env_file=[".env", "backend/.env"],
        env_file_encoding="utf-8-sig",
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()
