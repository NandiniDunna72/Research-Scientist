from datetime import datetime, timezone
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.models.paper import ResearchPaper
from app.models.project import ResearchProject
from app.models.analysis import PaperAnalysis
from app.schemas.paper import (
    PaperSearchRequest,
    PaperSearchResponse,
    DiscoveredPaper,
    SavePaperRequest,
    SavedPaperResponse,
    PaperMessageResponse,
)
from app.schemas.analysis import (
    PaperAnalysisResponse,
    AnalyzePaperRequest,
)
from app.services.paper_discovery import PaperDiscoveryService
from app.services.paper_analysis import PaperAnalysisService

logger = logging.getLogger("papers_router")
router = APIRouter()


@router.post(
    "/search",
    response_model=PaperSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Discover Academic Research Papers (POST)",
    description=(
        "Searches reliable academic sources (Semantic Scholar, arXiv, Crossref) concurrently, "
        "normalizes metadata, removes duplicates, ranks by relevance, and returns a maximum of 20 papers."
    ),
    responses={
        200: {"description": "Discovered papers list"},
        400: {"description": "Empty or invalid search query"},
        401: {"description": "Unauthorized access"},
    },
)
async def search_papers_post(
    req: PaperSearchRequest,
    current_user: User = Depends(get_current_user),
):
    cleaned_query = (req.query or "").strip()
    if not cleaned_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty. Please enter a research topic or keywords.",
        )

    limit = min(max(1, req.limit or 20), 20)
    papers = await PaperDiscoveryService.discover_papers(
        user_id=current_user.id,
        query=cleaned_query,
        limit=limit,
    )

    message = None
    if not papers:
        message = "No relevant research papers were found. Try a broader research topic or different keywords."

    return PaperSearchResponse(
        query=cleaned_query,
        total=len(papers),
        papers=[DiscoveredPaper(**p) for p in papers],
        message=message,
    )


@router.get(
    "/search",
    response_model=PaperSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Discover Academic Research Papers (GET)",
    description="Convenience GET endpoint to search academic papers with query parameters.",
    responses={
        200: {"description": "Discovered papers list"},
        400: {"description": "Empty or invalid search query"},
        401: {"description": "Unauthorized access"},
    },
)
async def search_papers_get(
    query: str = Query(..., min_length=1, description="Research topic or keywords"),
    limit: int = Query(20, ge=1, le=20, description="Maximum papers to return (max 20)"),
    current_user: User = Depends(get_current_user),
):
    req = PaperSearchRequest(query=query, limit=limit)
    return await search_papers_post(req, current_user=current_user)


@router.post(
    "",
    response_model=SavedPaperResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save Discovered Paper to Database",
    description="Saves a research paper to PostgreSQL for the authenticated user and optional project.",
    responses={
        201: {"description": "Paper saved successfully"},
        400: {"description": "Invalid paper payload"},
        401: {"description": "Unauthorized access"},
        403: {"description": "Project does not belong to authenticated user"},
        404: {"description": "Specified project not found"},
    },
)
def save_paper(
    req: SavePaperRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify project ownership if project_id provided
    resolved_project_id: Optional[int] = None
    if req.project_id is not None:
        if isinstance(req.project_id, int):
            resolved_project_id = req.project_id
        elif isinstance(req.project_id, str):
            if req.project_id.isdigit():
                resolved_project_id = int(req.project_id)
            else:
                # String ID from mock frontend (e.g., 'proj-123')
                # Try to find matching project by title or user's first project
                proj_by_topic = db.query(ResearchProject).filter(
                    ResearchProject.user_id == current_user.id
                ).first()
                if proj_by_topic:
                    resolved_project_id = proj_by_topic.id

        if resolved_project_id is not None:
            project = db.query(ResearchProject).filter(ResearchProject.id == resolved_project_id).first()
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Research project {req.project_id} not found.",
                )
            if project.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to add papers to this research project.",
                )

    # Check for existing duplicate saved paper for this user
    query = db.query(ResearchPaper).filter(ResearchPaper.user_id == current_user.id)
    if req.external_id:
        existing = query.filter(ResearchPaper.external_id == req.external_id).first()
        if existing:
            return existing
    if req.doi:
        existing = query.filter(ResearchPaper.doi == req.doi.lower().strip()).first()
        if existing:
            return existing

    # Fallback title match for duplicate prevention
    clean_title = req.title.strip().lower()
    existing = query.filter(ResearchPaper.title.ilike(clean_title)).first()
    if existing:
        return existing

    # Normalize authors to list of strings or dicts
    authors_data = req.authors or []
    normalized_authors = []
    for a in authors_data:
        if isinstance(a, str):
            normalized_authors.append(a)
        elif isinstance(a, dict) and a.get("name"):
            normalized_authors.append(a.get("name"))
        else:
            normalized_authors.append(str(a))

    new_paper = ResearchPaper(
        project_id=resolved_project_id,
        user_id=current_user.id,
        external_id=req.external_id,
        title=req.title.strip(),
        abstract=req.abstract,
        authors=normalized_authors,
        publication_year=req.publication_year,
        publication_date=req.publication_date,
        venue=req.venue,
        doi=req.doi.lower().strip() if req.doi else None,
        paper_url=req.paper_url,
        pdf_url=req.pdf_url,
        citation_count=req.citation_count or 0,
        source=req.source,
        publication_type=req.publication_type,
        relevance_score=req.relevance_score or 0,
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    return new_paper


@router.get(
    "",
    response_model=List[SavedPaperResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Saved Research Papers",
    description="Retrieves papers saved in PostgreSQL for the authenticated user with strict user isolation.",
    responses={
        200: {"description": "List of saved papers"},
        401: {"description": "Unauthorized access"},
    },
)
def get_saved_papers(
    project_id: Optional[str] = Query(None, description="Optional project ID to filter saved papers"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ResearchPaper).filter(ResearchPaper.user_id == current_user.id)
    if project_id is not None:
        try:
            pid = int(project_id)
            query = query.filter(ResearchPaper.project_id == pid)
        except (ValueError, TypeError):
            pass

    papers = query.order_by(ResearchPaper.created_at.desc()).all()
    return papers


@router.get(
    "/{paper_id}",
    response_model=SavedPaperResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Saved Paper Details",
    description="Retrieves details for a specific saved paper owned by the authenticated user.",
    responses={
        200: {"description": "Saved paper details"},
        401: {"description": "Unauthorized access"},
        403: {"description": "Forbidden - paper belongs to another user"},
        404: {"description": "Paper not found"},
    },
)
def get_paper_details(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research paper {paper_id} not found.",
        )

    if paper.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this paper.",
        )

    return paper


@router.delete(
    "/{paper_id}",
    response_model=PaperMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Saved Research Paper",
    description="Deletes a saved research paper owned by the authenticated user from PostgreSQL.",
    responses={
        200: {"description": "Paper deleted successfully"},
        401: {"description": "Unauthorized access"},
        403: {"description": "Forbidden - paper belongs to another user"},
        404: {"description": "Paper not found"},
    },
)
def delete_saved_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research paper {paper_id} not found.",
        )

    if paper.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this paper.",
        )

    db.delete(paper)
    db.commit()

    return PaperMessageResponse(
        message="Paper deleted successfully.",
        paper_id=paper_id,
    )


# =======================================================================
# Paper Analysis Endpoints
# =======================================================================

def _get_paper_with_ownership_check(paper_id_param: str, user_id: int, db: Session) -> ResearchPaper:
    """Retrieves paper ensuring strict user data isolation (403 or 404)."""
    all_query = db.query(ResearchPaper)
    paper_any: Optional[ResearchPaper] = None
    if paper_id_param.isdigit():
        paper_any = all_query.filter(ResearchPaper.id == int(paper_id_param)).first()
    if not paper_any:
        paper_any = all_query.filter(ResearchPaper.external_id == paper_id_param).first()

    if not paper_any:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research paper '{paper_id_param}' not found.",
        )

    if paper_any.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access or analyze this paper.",
        )

    return paper_any


@router.post(
    "/{paper_id}/analyze",
    response_model=PaperAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Academic Paper",
    description="Generates or retrieves structured academic analysis for a paper owned by the user.",
    responses={
        200: {"description": "Structured paper analysis"},
        400: {"description": "Missing usable content"},
        401: {"description": "Unauthorized"},
        403: {"description": "Paper belongs to another user"},
        404: {"description": "Paper not found"},
    },
)
async def analyze_paper(
    paper_id: str,
    req: Optional[AnalyzePaperRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = _get_paper_with_ownership_check(paper_id, current_user.id, db)

    force_regenerate = req.force_regenerate if req else False

    # Check for existing saved analysis (caching/reuse - Requirement 23)
    if not force_regenerate:
        existing = (
            db.query(PaperAnalysis)
            .filter(PaperAnalysis.paper_id == paper.id, PaperAnalysis.user_id == current_user.id)
            .order_by(PaperAnalysis.updated_at.desc())
            .first()
        )
        if existing:
            return existing

    # Extract paper content (PDF -> Abstract -> Metadata)
    try:
        content, source_type = await PaperAnalysisService.extract_paper_content(paper)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Perform structured academic analysis
    try:
        analysis_data = await PaperAnalysisService.analyze_paper_content(paper, content, source_type)
    except Exception as e:
        logger.error(f"Analysis generation failed for paper {paper.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Paper analysis generation failed. Please try again later.",
        )

    # Save / Update in PostgreSQL
    analysis = (
        db.query(PaperAnalysis)
        .filter(PaperAnalysis.paper_id == paper.id, PaperAnalysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        analysis = PaperAnalysis(
            paper_id=paper.id,
            user_id=current_user.id,
            **analysis_data,
        )
        db.add(analysis)
    else:
        for k, v in analysis_data.items():
            setattr(analysis, k, v)
        analysis.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(analysis)
    return analysis


@router.get(
    "/{paper_id}/analysis",
    response_model=PaperAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Saved Paper Analysis",
    description="Retrieves the latest structured academic analysis for a paper owned by the user.",
    responses={
        200: {"description": "Saved paper analysis"},
        401: {"description": "Unauthorized"},
        403: {"description": "Paper belongs to another user"},
        404: {"description": "Analysis or paper not found"},
    },
)
def get_paper_analysis(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = _get_paper_with_ownership_check(paper_id, current_user.id, db)

    analysis = (
        db.query(PaperAnalysis)
        .filter(PaperAnalysis.paper_id == paper.id, PaperAnalysis.user_id == current_user.id)
        .order_by(PaperAnalysis.updated_at.desc())
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis has not been generated for paper {paper_id}.",
        )

    return analysis


@router.post(
    "/{paper_id}/analysis/regenerate",
    response_model=PaperAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Regenerate Paper Analysis",
    description="Forces regeneration of academic analysis for a paper owned by the user.",
    responses={
        200: {"description": "Regenerated paper analysis"},
        401: {"description": "Unauthorized"},
        403: {"description": "Paper belongs to another user"},
        404: {"description": "Paper not found"},
    },
)
async def regenerate_paper_analysis(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = AnalyzePaperRequest(force_regenerate=True)
    return await analyze_paper(paper_id, req=req, db=db, current_user=current_user)
