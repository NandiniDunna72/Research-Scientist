import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Research Scientist API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database connection URL
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/ai_research_scientist"

    # JWT Authentication
    JWT_SECRET_KEY: str = "ai_research_scientist_secret_jwt_key_2026_super_secure_32b"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS settings
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # AI Service Configuration
    AI_API_KEY: Union[str, None] = None
    AI_PROVIDER: str = "auto"
    AI_MODEL: str = "gemini-3.5-flash"

    # Free Agentic RAG Configuration (Local / Open-Source)
    LLM_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "llama3.2:3b"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    VECTOR_STORE_PATH: str = "./data/chroma"
    RAG_TOP_K: int = 5
    MAX_RETRIEVAL_ITERATIONS: int = 2

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Union[str, None]) -> str:
        if not v:
            return "postgresql+psycopg://postgres:postgres@localhost:5432/ai_research_scientist"
        # Support standard postgresql:// schema by redirecting to psycopg v3 driver
        if v.startswith("postgresql://") and not v.startswith(("postgresql+psycopg://", "postgresql+psycopg2://")):
            return v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
