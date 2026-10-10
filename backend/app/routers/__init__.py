"""Routers package."""

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

__all__ = [
    "auth_router",
    "users_router",
    "papers_router",
    "projects_router",
    "gaps_router",
    "questions_router",
    "literature_review_router",
    "methodology_router",
    "comparison_router",
    "architecture_router",
    "documentation_router",
    "presentations_router",
]


