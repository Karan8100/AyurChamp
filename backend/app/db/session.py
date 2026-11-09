import ssl

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings

# asyncpg doesn't understand the `sslmode`/`channel_binding` query params that
# cloud providers (Neon, Supabase) put in their connection strings — SSL has
# to be passed as a proper SSLContext via connect_args instead.
connect_args = {}
if settings.db_ssl_required and not settings.database_url.startswith("sqlite"):
    ssl_context = ssl.create_default_context()
    connect_args["ssl"] = ssl_context

engine = create_async_engine(
    settings.database_url,
    echo=settings.environment == "development",
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
)


async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session():
    async with async_session() as session:
        yield session
