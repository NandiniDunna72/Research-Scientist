"""Database models package."""

from app.models.user import User
from app.models.project import ResearchProject
from app.models.paper import ResearchPaper
from app.models.analysis import PaperAnalysis
from app.models.gap import ResearchGapAnalysis, ResearchGap
from app.models.question import ResearchQuestionGeneration, ResearchQuestion
from app.models.literature_review import (
    LiteratureReviewGeneration,
    LiteratureReviewTheme,
    LiteratureReviewPaperSummary,
)
from app.models.methodology import ResearchMethodologyGeneration
from app.models.comparison import ResearchPaperComparison
from app.models.architecture import ArchitectureGeneration
from app.models.documentation import ResearchDocumentation
from app.models.presentation import ResearchPresentation

__all__ = [
    "User",
    "ResearchProject",
    "ResearchPaper",
    "PaperAnalysis",
    "ResearchGapAnalysis",
    "ResearchGap",
    "ResearchQuestionGeneration",
    "ResearchQuestion",
    "LiteratureReviewGeneration",
    "LiteratureReviewTheme",
    "LiteratureReviewPaperSummary",
    "ResearchMethodologyGeneration",
    "ResearchPaperComparison",
    "ArchitectureGeneration",
    "ResearchDocumentation",
    "ResearchPresentation",
]

