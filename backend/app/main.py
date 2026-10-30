from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.core.config import settings
from app.database.database import Base, engine, SessionLocal
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.papers import router as papers_router
from app.routers.projects import router as projects_router
from app.routers.gaps import router as gaps_router
from app.routers.questions import router as questions_router
from app.routers.literature_review import router as literature_review_router
from app.routers.methodology import router as methodology_router
from app.routers.comparison import router as comparison_router
from app.routers.architecture import router as architecture_router
from app.routers.documentation import router as documentation_router
from app.routers.presentations import router as presentations_router
from app.routers.rag_agent import router as rag_agent_router
from app.routers.research_chat import router as research_chat_router



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist without dropping existing tables or data
    try:
        import app.models  # Ensures all model tables are registered before create_all
        Base.metadata.create_all(bind=engine)
        print("[INFO] Database tables verified successfully.")
    except Exception as e:
        print(f"[WARNING] Database verification warning: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API and PostgreSQL integration for AI Research Scientist.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS for React Frontend
origins = list(set([
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + settings.ALLOWED_ORIGINS))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler to return both 'detail' and 'error' keys for frontend resilience
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    headers = getattr(exc, "headers", None)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error": exc.detail},
        headers=headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0]["msg"] if errors else "Validation error"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": first_error, "error": first_error, "errors": errors},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Server error: {str(exc)}", "error": str(exc)},
    )


# Health Check Endpoints
@app.get("/api/health", tags=["Health"], summary="API Health Check")
def health_check():
    return {"status": "ok", "service": "AI Research Scientist API"}


@app.get("/health", tags=["Health"], include_in_schema=False)
def root_health():
    return {"status": "ok", "service": "AI Research Scientist API"}


@app.get("/api/health/db", tags=["Health"], summary="Database Health Check")
def database_health():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database unreachable: {str(e)}",
        )
    finally:
        db.close()


# Mount Routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(papers_router, prefix="/api/papers", tags=["Paper Discovery"])
app.include_router(projects_router, prefix="/api/projects", tags=["Research Projects"])
app.include_router(gaps_router, prefix="/api/research-gaps", tags=["Research Gaps"])
app.include_router(questions_router, prefix="/api/research-questions", tags=["Research Questions"])
app.include_router(literature_review_router, prefix="/api/literature-review", tags=["Literature Review"])
app.include_router(methodology_router, prefix="/api/methodology", tags=["Research Methodology"])
app.include_router(comparison_router, prefix="/api/paper-comparison", tags=["Paper Comparison"])
app.include_router(architecture_router, prefix="/api/architecture", tags=["System Architecture"])
app.include_router(documentation_router, prefix="/api/documentation", tags=["Research Documentation"])
app.include_router(presentations_router, prefix="/api/presentations", tags=["Presentations"])
app.include_router(rag_agent_router, prefix="/api/rag", tags=["RAG & Multi-Agent Engine"])
app.include_router(research_chat_router, prefix="/api/research-chat", tags=["Agentic RAG Research Chat"])



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
