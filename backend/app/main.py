import logging
import os
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlmodel import SQLModel, select

from app import models  # noqa: F401 — import registers tables on SQLModel.metadata
from app.db.session import engine
from app.models import User
from app.routers import assessment, auth, chatbot, diet, recommendations, report, ritucharya, vikriti

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables from models
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        # Ensure system guest user exists (id=0) so guest sessions never violate FK constraints
        try:
            res = await conn.execute(select(User).where(User.id == 0))
            if not res.first():
                if "sqlite" in engine.url.drivername:
                    await conn.execute(
                        text("INSERT OR IGNORE INTO user (id, name, email, role, is_active) VALUES (0, 'Guest Evaluator', 'guest@ayushya.org', 'guest', 1)")
                    )
                else:
                    await conn.execute(
                        text('INSERT INTO "user" (id, name, email, role, is_active) VALUES (0, \'Guest Evaluator\', \'guest@ayushya.org\', \'guest\', true) ON CONFLICT (id) DO NOTHING')
                    )
        except Exception as e:
            logger.warning("Could not auto-seed guest user: %s", e)
    yield


app = FastAPI(title="Prakruti Portal API", lifespan=lifespan)

# Allow local dev ports + Vercel / Render / Cloudflare deployments
cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if os.getenv("CORS_ORIGINS"):
    cors_origins.extend([o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$|^https://.*\.onrender\.com$|^https://.*\.pages\.dev$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "*")
    error_detail = f"{type(exc).__name__}: {str(exc)}"
    logger.error("Unhandled Exception at %s: %s\n%s", request.url.path, error_detail, traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": error_detail},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )


app.include_router(auth.router)
app.include_router(assessment.router)
app.include_router(diet.router)
app.include_router(vikriti.router)
app.include_router(ritucharya.router)
app.include_router(recommendations.router)
app.include_router(chatbot.router)
app.include_router(report.router)


@app.api_route("/", methods=["GET", "HEAD"])
@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "ok"}
