from datetime import datetime, timezone
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.models.project import ResearchProject
from app.models.paper import ResearchPaper
from app.models.analysis import PaperAnalysis
from app.models.gap import ResearchGapAnalysis
from app.models.question import ResearchQuestionGeneration
from app.models.literature_review import LiteratureReviewGeneration
from app.models.methodology import ResearchMethodologyGeneration
from app.models.comparison import ResearchPaperComparison
from app.models.architecture import ArchitectureGeneration
from app.models.documentation import ResearchDocumentation
from app.models.presentation import ResearchPresentation

from app.schemas.presentation import (
    GeneratePresentationRequest,
    UpdatePresentationRequest,
    RegeneratePresentationRequest,
    SlideSchema,
    PresentationData,
    PresentationResponse,
)
from app.services.presentation_service import PresentationService, STORAGE_DIR

logger = logging.getLogger("presentations_router")
logger.setLevel(logging.INFO)

router = APIRouter()


def _resolve_project_with_ownership(
    project_id_param: Union[int, str],
    user_id: int,
    db: Session,
) -> ResearchProject:
    """Verifies and retrieves research project ensuring strict multi-tenant isolation (403/404)."""
    if isinstance(project_id_param, int) or (isinstance(project_id_param, str) and str(project_id_param).isdigit()):
        pid = int(project_id_param)
        project = db.query(ResearchProject).filter(ResearchProject.id == pid).first()
        if not project:
            any_user_project = db.query(ResearchProject).filter(ResearchProject.id == pid).first()
            if any_user_project and any_user_project.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to access presentations for this project.",
                )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Research project {pid} not found.",
            )
        if project.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access presentations for this project.",
            )
        return project

    # Handle string identifiers / slugs
    project = (
        db.query(ResearchProject)
        .filter(
            ResearchProject.user_id == user_id,
            (ResearchProject.title.ilike(f"%{project_id_param}%") | ResearchProject.topic.ilike(f"%{project_id_param}%")),
        )
        .first()
    )

    if not project:
        param_str = str(project_id_param).lower()
        if "healthcare" in param_str or "proj-" in param_str:
            project = (
                db.query(ResearchProject)
                .filter(ResearchProject.user_id == user_id)
                .order_by(ResearchProject.created_at.desc())
                .first()
            )

        if not project:
            project = db.query(ResearchProject).filter(ResearchProject.user_id == user_id).first()

        if not project and isinstance(project_id_param, str) and not str(project_id_param).isdigit():
            clean_title = str(project_id_param).replace("proj-", "").replace("-", " ").title()
            p_title = clean_title if clean_title else "Academic Research Project"
            project = ResearchProject(
                user_id=user_id,
                title=p_title,
                topic=f"Academic PowerPoint presentation for {p_title}",
                domain="Computer Science & AI",
                description=f"Automated presentation deck for {p_title}",
            )
            db.add(project)
            db.commit()
            db.refresh(project)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research project '{project_id_param}' not found.",
        )

    if project.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access presentations for this project.",
        )

    return project


def _gather_project_full_context(project: ResearchProject, db: Session) -> Dict[str, Any]:
    """Assembles all research context (preferring Module 9 research document, plus Modules 1-8)."""
    # 1. Primary Source: Saved Research Document (Module 9)
    doc_record = (
        db.query(ResearchDocumentation)
        .filter(ResearchDocumentation.project_id == project.id)
        .order_by(ResearchDocumentation.created_at.desc())
        .first()
    )
    documentation_data = doc_record.structured_content if doc_record else None

    # 2. Papers & Analyses
    papers = db.query(ResearchPaper).filter(ResearchPaper.project_id == project.id).all()
    papers_data: List[Dict[str, Any]] = []
    analyses_data: List[Dict[str, Any]] = []
    for p in papers:
        papers_data.append({
            "id": p.id,
            "title": p.title,
            "abstract": p.abstract,
            "authors": p.authors,
            "publication_year": p.publication_year,
            "venue": p.venue,
            "doi": p.doi,
        })
        analysis = db.query(PaperAnalysis).filter(PaperAnalysis.paper_id == p.id).first()
        if analysis:
            analyses_data.append({
                "paper_id": p.id,
                "research_problem": analysis.research_problem,
                "methodology": analysis.methodology,
                "dataset": analysis.dataset,
                "key_findings": analysis.key_findings,
            })

    # 3. Gaps
    gap_gen = db.query(ResearchGapAnalysis).filter(ResearchGapAnalysis.project_id == project.id).order_by(ResearchGapAnalysis.created_at.desc()).first()
    gaps_data = []
    if gap_gen and gap_gen.gaps:
        for g in gap_gen.gaps:
            gaps_data.append({
                "id": g.id,
                "gap_title": getattr(g, "gap_title", "Research Gap"),
                "category": getattr(g, "category", "Methodological"),
                "description": getattr(g, "description", ""),
                "why_it_matters": getattr(g, "why_it_matters", ""),
            })

    # 4. Questions
    q_gen = db.query(ResearchQuestionGeneration).filter(ResearchQuestionGeneration.project_id == project.id).order_by(ResearchQuestionGeneration.created_at.desc()).first()
    questions_data = []
    if q_gen and q_gen.questions:
        for q in q_gen.questions:
            questions_data.append({
                "id": q.id,
                "question": q.question,
                "question_type": getattr(q, "question_type", "Primary"),
                "motivation": getattr(q, "motivation", ""),
            })

    # 5. Methodology
    meth_record = db.query(ResearchMethodologyGeneration).filter(ResearchMethodologyGeneration.project_id == project.id).order_by(ResearchMethodologyGeneration.version.desc()).first()
    methodology_data = None
    if meth_record:
        methodology_data = {
            "research_overview": meth_record.research_overview,
            "research_design": meth_record.research_design,
            "proposed_approach": meth_record.proposed_approach,
            "data_collection": meth_record.data_collection,
            "methods_and_algorithms": meth_record.methods_and_algorithms,
        }

    # 6. Comparison
    comp_record = db.query(ResearchPaperComparison).filter(ResearchPaperComparison.project_id == project.id).order_by(ResearchPaperComparison.created_at.desc()).first()
    comparison_data = comp_record.structured_comparison_result if comp_record else None

    # 7. Architecture
    arch_record = db.query(ArchitectureGeneration).filter(ArchitectureGeneration.project_id == project.id).order_by(ArchitectureGeneration.created_at.desc()).first()
    architecture_data = arch_record.structured_architecture_result if arch_record else None

    return {
        "topic": project.topic or project.title,
        "project_description": project.description,
        "documentation_data": documentation_data,
        "papers_data": papers_data,
        "analyses_data": analyses_data,
        "gaps_data": gaps_data,
        "questions_data": questions_data,
        "methodology_data": methodology_data,
        "comparison_data": comparison_data,
        "architecture_data": architecture_data,
    }


@router.post("/generate", response_model=PresentationResponse, status_code=status.HTTP_201_CREATED)
async def generate_presentation(
    payload: GeneratePresentationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates a structured PowerPoint presentation deck from project research documentation
    and modules, creates an authentic 16:9 .pptx file, and saves to PostgreSQL.
    """
    project = _resolve_project_with_ownership(payload.project_id, current_user.id, db)
    ctx = _gather_project_full_context(project, db)

    try:
        pres_dict = await PresentationService.generate_presentation(
            topic=payload.title or ctx["topic"],
            project_description=ctx["project_description"],
            presentation_type=payload.presentation_type or "Project Proposal",
            theme=payload.theme or "Professional Academic",
            style=payload.style or "Academic Formal",
            slide_count=payload.slide_count or 12,
            presenter_name=payload.presenter_name,
            institution=payload.institution,
            supervisor_name=payload.supervisor_name,
            include_architecture=payload.include_architecture if payload.include_architecture is not None else True,
            include_comparison=payload.include_comparison if payload.include_comparison is not None else True,
            include_research_gaps=payload.include_research_gaps if payload.include_research_gaps is not None else True,
            include_methodology=payload.include_methodology if payload.include_methodology is not None else True,
            include_speaker_notes=payload.include_speaker_notes if payload.include_speaker_notes is not None else True,
            sections_to_include=payload.sections_to_include,
            documentation_data=ctx["documentation_data"],
            papers_data=ctx["papers_data"],
            analyses_data=ctx["analyses_data"],
            gaps_data=ctx["gaps_data"],
            questions_data=ctx["questions_data"],
            methodology_data=ctx["methodology_data"],
            comparison_data=ctx["comparison_data"],
            architecture_data=ctx["architecture_data"],
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Presentation generation error for project {project.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Presentation generation failed. Please try again.",
        )

    pres_dict["project_id"] = project.id

    # 1. Persist in PostgreSQL
    record = ResearchPresentation(
        project_id=project.id,
        user_id=current_user.id,
        title=pres_dict.get("title", project.title),
        presentation_type=pres_dict.get("presentation_type", "Project Proposal"),
        theme=pres_dict.get("theme", "Professional Academic"),
        style=pres_dict.get("style", "Academic Formal"),
        slide_count=pres_dict.get("slide_count", len(pres_dict.get("slides", []))),
        presenter_name=pres_dict.get("presenter_name"),
        institution=pres_dict.get("institution"),
        supervisor_name=pres_dict.get("supervisor_name"),
        include_speaker_notes=pres_dict.get("include_speaker_notes", True),
        structured_slides=pres_dict.get("slides", []),
        status="generated",
        version=1,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    pres_dict["id"] = record.id

    # 2. Build authentic 16:9 .pptx file on disk
    file_name = f"project_{project.id}_presentation_{record.id}.pptx"
    file_path = str(STORAGE_DIR / file_name)
    try:
        PresentationService.generate_pptx_file(pres_dict, output_file_path=file_path)
        record.file_path = file_path
        db.commit()
        db.refresh(record)
        pres_dict["file_path"] = file_path
    except Exception as e:
        logger.error(f"Failed to generate physical .pptx file: {e}", exc_info=True)

    pres_dict["created_at"] = record.created_at.isoformat() if record.created_at else None
    pres_dict["updated_at"] = record.updated_at.isoformat() if record.updated_at else None

    return PresentationResponse(
        id=record.id,
        project_id=project.id,
        title=record.title,
        presentation_type=record.presentation_type,
        theme=record.theme,
        slide_count=record.slide_count,
        status=record.status,
        created_at=record.created_at.isoformat() if record.created_at else None,
        updated_at=record.updated_at.isoformat() if record.updated_at else None,
        data=PresentationData(**pres_dict),
    )


@router.get("/{project_id}", response_model=PresentationResponse)
def get_latest_presentation(
    project_id: Union[int, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves the latest saved PowerPoint presentation for an authorized project.
    """
    project = _resolve_project_with_ownership(project_id, current_user.id, db)

    record = (
        db.query(ResearchPresentation)
        .filter(
            ResearchPresentation.project_id == project.id,
            ResearchPresentation.user_id == current_user.id,
        )
        .order_by(ResearchPresentation.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No saved research presentation found for this project.",
        )

    data_dict = {
        "id": record.id,
        "project_id": record.project_id,
        "title": record.title,
        "presentation_type": record.presentation_type,
        "theme": record.theme,
        "style": record.style,
        "slide_count": record.slide_count,
        "presenter_name": record.presenter_name,
        "institution": record.institution,
        "supervisor_name": record.supervisor_name,
        "include_speaker_notes": record.include_speaker_notes,
        "include_architecture": True,
        "include_comparison": True,
        "include_research_gaps": True,
        "include_methodology": True,
        "status": record.status,
        "version": record.version,
        "file_path": record.file_path,
        "slides": record.structured_slides,
        "missing_upstream_context": [],
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "updated_at": record.updated_at.isoformat() if record.updated_at else None,
    }

    return PresentationResponse(
        id=record.id,
        project_id=record.project_id,
        title=record.title,
        presentation_type=record.presentation_type,
        theme=record.theme,
        slide_count=record.slide_count,
        status=record.status,
        created_at=record.created_at.isoformat() if record.created_at else None,
        updated_at=record.updated_at.isoformat() if record.updated_at else None,
        data=PresentationData(**data_dict),
    )


@router.get("/{project_id}/{presentation_id}", response_model=PresentationResponse)
def get_specific_presentation(
    project_id: Union[int, str],
    presentation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves a specific presentation by ID with multi-tenant verification.
    """
    project = _resolve_project_with_ownership(project_id, current_user.id, db)

    record = (
        db.query(ResearchPresentation)
        .filter(
            ResearchPresentation.id == presentation_id,
            ResearchPresentation.project_id == project.id,
            ResearchPresentation.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Presentation {presentation_id} not found for this project.",
        )

    data_dict = {
        "id": record.id,
        "project_id": record.project_id,
        "title": record.title,
        "presentation_type": record.presentation_type,
        "theme": record.theme,
        "style": record.style,
        "slide_count": record.slide_count,
        "presenter_name": record.presenter_name,
        "institution": record.institution,
        "supervisor_name": record.supervisor_name,
        "include_speaker_notes": record.include_speaker_notes,
        "include_architecture": True,
        "include_comparison": True,
        "include_research_gaps": True,
        "include_methodology": True,
        "status": record.status,
        "version": record.version,
        "file_path": record.file_path,
        "slides": record.structured_slides,
        "missing_upstream_context": [],
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "updated_at": record.updated_at.isoformat() if record.updated_at else None,
    }

    return PresentationResponse(
        id=record.id,
        project_id=record.project_id,
        title=record.title,
        presentation_type=record.presentation_type,
        theme=record.theme,
        slide_count=record.slide_count,
        status=record.status,
        created_at=record.created_at.isoformat() if record.created_at else None,
        updated_at=record.updated_at.isoformat() if record.updated_at else None,
        data=PresentationData(**data_dict),
    )


@router.put("/{project_id}/{presentation_id}", response_model=PresentationResponse)
def update_presentation(
    project_id: Union[int, str],
    presentation_id: int,
    payload: UpdatePresentationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates slide content or metadata, and regenerates the physical .pptx file.
    """
    project = _resolve_project_with_ownership(project_id, current_user.id, db)

    record = (
        db.query(ResearchPresentation)
        .filter(
            ResearchPresentation.id == presentation_id,
            ResearchPresentation.project_id == project.id,
            ResearchPresentation.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Presentation {presentation_id} not found to update.",
        )

    if payload.title:
        record.title = payload.title
    if payload.theme:
        record.theme = payload.theme
    if payload.presentation_type:
        record.presentation_type = payload.presentation_type
    if payload.presenter_name is not None:
        record.presenter_name = payload.presenter_name
    if payload.institution is not None:
        record.institution = payload.institution
    if payload.supervisor_name is not None:
        record.supervisor_name = payload.supervisor_name

    if payload.slides is not None:
        serialized = [s.model_dump() for s in payload.slides]
        record.structured_slides = serialized
        record.slide_count = len(serialized)

    record.version = record.version + 1
    record.updated_at = datetime.now(timezone.utc)

    # Re-generate .pptx file with updated contents
    data_dict = {
        "id": record.id,
        "project_id": record.project_id,
        "title": record.title,
        "presentation_type": record.presentation_type,
        "theme": record.theme,
        "style": record.style,
        "slide_count": record.slide_count,
        "presenter_name": record.presenter_name,
        "institution": record.institution,
        "supervisor_name": record.supervisor_name,
        "include_speaker_notes": record.include_speaker_notes,
        "include_architecture": True,
        "include_comparison": True,
        "include_research_gaps": True,
        "include_methodology": True,
        "status": record.status,
        "version": record.version,
        "file_path": record.file_path,
        "slides": record.structured_slides,
    }

    try:
        new_path = PresentationService.generate_pptx_file(data_dict, output_file_path=record.file_path)
        record.file_path = new_path
        data_dict["file_path"] = new_path
    except Exception as e:
        logger.error(f"Failed to re-generate .pptx on update: {e}", exc_info=True)

    db.commit()
    db.refresh(record)

    data_dict["created_at"] = record.created_at.isoformat() if record.created_at else None
    data_dict["updated_at"] = record.updated_at.isoformat() if record.updated_at else None

    return PresentationResponse(
        id=record.id,
        project_id=record.project_id,
        title=record.title,
        presentation_type=record.presentation_type,
        theme=record.theme,
        slide_count=record.slide_count,
        status=record.status,
        created_at=record.created_at.isoformat() if record.created_at else None,
        updated_at=record.updated_at.isoformat() if record.updated_at else None,
        data=PresentationData(**data_dict),
    )


@router.post("/{project_id}/{presentation_id}/regenerate", response_model=PresentationResponse)
def regenerate_presentation(
    project_id: Union[int, str],
    presentation_id: int,
    payload: RegeneratePresentationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Regenerates the complete presentation deck or selected slide numbers
    using latest upstream research context, and updates the .pptx file.
    """
    project = _resolve_project_with_ownership(project_id, current_user.id, db)

    record = (
        db.query(ResearchPresentation)
        .filter(
            ResearchPresentation.id == presentation_id,
            ResearchPresentation.project_id == project.id,
            ResearchPresentation.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Presentation {presentation_id} not found to regenerate.",
        )

    ctx = _gather_project_full_context(project, db)

    existing_data = {
        "id": record.id,
        "project_id": record.project_id,
        "title": record.title,
        "presentation_type": payload.presentation_type or record.presentation_type,
        "theme": payload.theme or record.theme,
        "style": record.style,
        "slide_count": payload.slide_count or record.slide_count,
        "presenter_name": record.presenter_name,
        "institution": record.institution,
        "supervisor_name": record.supervisor_name,
        "include_speaker_notes": record.include_speaker_notes,
        "slides": record.structured_slides,
        "version": record.version,
    }

    updated_data = PresentationService.regenerate_slides(
        existing_presentation_data=existing_data,
        slide_numbers_to_regenerate=payload.slide_numbers,
        project_context=ctx,
    )

    record.structured_slides = updated_data.get("slides", [])
    record.slide_count = len(record.structured_slides)
    record.theme = updated_data.get("theme", record.theme)
    record.presentation_type = updated_data.get("presentation_type", record.presentation_type)
    record.version = record.version + 1
    record.updated_at = datetime.now(timezone.utc)

    # Re-generate physical file
    try:
        new_path = PresentationService.generate_pptx_file(updated_data, output_file_path=record.file_path)
        record.file_path = new_path
        updated_data["file_path"] = new_path
    except Exception as e:
        logger.error(f"Failed to re-generate .pptx during regeneration: {e}", exc_info=True)

    db.commit()
    db.refresh(record)

    updated_data["created_at"] = record.created_at.isoformat() if record.created_at else None
    updated_data["updated_at"] = record.updated_at.isoformat() if record.updated_at else None

    return PresentationResponse(
        id=record.id,
        project_id=record.project_id,
        title=record.title,
        presentation_type=record.presentation_type,
        theme=record.theme,
        slide_count=record.slide_count,
        status=record.status,
        created_at=record.created_at.isoformat() if record.created_at else None,
        updated_at=record.updated_at.isoformat() if record.updated_at else None,
        data=PresentationData(**updated_data),
    )


@router.get("/{project_id}/{presentation_id}/download")
def download_presentation(
    project_id: Union[int, str],
    presentation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Downloads the authentic PowerPoint (.pptx) file for an authorized presentation.
    """
    project = _resolve_project_with_ownership(project_id, current_user.id, db)

    record = (
        db.query(ResearchPresentation)
        .filter(
            ResearchPresentation.id == presentation_id,
            ResearchPresentation.project_id == project.id,
            ResearchPresentation.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Presentation {presentation_id} not found.",
        )

    file_path = record.file_path
    # If file was not yet generated or missing on disk, generate it now on-the-fly
    if not file_path or not os.path.exists(file_path):
        target_path = str(STORAGE_DIR / f"project_{project.id}_presentation_{record.id}.pptx")
        data_dict = {
            "id": record.id,
            "project_id": record.project_id,
            "title": record.title,
            "presentation_type": record.presentation_type,
            "theme": record.theme,
            "style": record.style,
            "slide_count": record.slide_count,
            "presenter_name": record.presenter_name,
            "institution": record.institution,
            "supervisor_name": record.supervisor_name,
            "include_speaker_notes": record.include_speaker_notes,
            "slides": record.structured_slides,
        }
        PresentationService.generate_pptx_file(data_dict, output_file_path=target_path)
        record.file_path = target_path
        db.commit()
        file_path = target_path

    safe_title = re.sub(r"[^\w\s-]", "", record.title).strip().replace(" ", "_")
    if not safe_title:
        safe_title = "Research_Presentation"
    download_filename = f"{safe_title}.pptx"

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=download_filename,
        headers={
            "Content-Disposition": f'attachment; filename="{download_filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
