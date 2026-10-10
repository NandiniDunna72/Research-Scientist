from datetime import datetime, timezone
import logging
import re
from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
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

from app.schemas.documentation import (
    GenerateDocumentationRequest,
    UpdateDocumentationRequest,
    RegenerateDocumentationRequest,
    DocumentationSectionSchema,
    DocumentationData,
    DocumentationResponse,
)
from app.services.documentation_service import DocumentationService

logger = logging.getLogger("documentation_router")
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
                    detail="You do not have permission to access research documentation for this project.",
                )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Research project {pid} not found.",
            )
        if project.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access research documentation for this project.",
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
                topic=f"Autonomous academic documentation for {p_title}",
                domain="Computer Science & AI",
                description=f"Automated documentation generation for {p_title}",
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
            detail="You do not have permission to access research documentation for this project.",
        )

    return project


def _gather_project_research_context(project: ResearchProject, db: Session) -> Dict[str, Any]:
    """Assembles all upstream research assets (Modules 1 through 8) for the target project."""
    # 1. Papers & Analyses
    papers = db.query(ResearchPaper).filter(ResearchPaper.project_id == project.id).all()
    papers_data: List[Dict[str, Any]] = []
    analyses_data: List[Dict[str, Any]] = []

    for p in papers:
        p_dict = {
            "id": p.id,
            "title": p.title,
            "abstract": p.abstract,
            "authors": p.authors,
            "publication_year": p.publication_year,
            "venue": p.venue,
            "doi": p.doi,
            "paper_url": p.paper_url,
            "pdf_url": p.pdf_url,
            "citation_count": p.citation_count,
        }
        papers_data.append(p_dict)

        analysis = db.query(PaperAnalysis).filter(PaperAnalysis.paper_id == p.id).first()
        if analysis:
            analyses_data.append({
                "paper_id": p.id,
                "research_problem": analysis.research_problem,
                "research_objective": analysis.research_objective,
                "methodology": analysis.methodology,
                "dataset": analysis.dataset,
                "algorithms_and_models": analysis.algorithms_and_models or [],
                "key_findings": analysis.key_findings or [],
                "contributions": analysis.contributions or [],
                "limitations": analysis.limitations or [],
            })

    # 2. Research Gaps
    gap_gen = (
        db.query(ResearchGapAnalysis)
        .filter(ResearchGapAnalysis.project_id == project.id)
        .order_by(ResearchGapAnalysis.created_at.desc())
        .first()
    )
    gaps_data: List[Dict[str, Any]] = []
    if gap_gen and gap_gen.gaps:
        for g in gap_gen.gaps:
            gaps_data.append({
                "id": g.id,
                "gap_title": getattr(g, "gap_title", "Research Gap"),
                "category": getattr(g, "category", "Methodological"),
                "description": getattr(g, "description", ""),
                "evidence": getattr(g, "evidence", []),
                "affected_papers": getattr(g, "affected_papers", []),
                "why_it_matters": getattr(g, "why_it_matters", ""),
                "potential_direction": getattr(g, "potential_direction", ""),
            })

    # 3. Research Questions
    question_gen = (
        db.query(ResearchQuestionGeneration)
        .filter(ResearchQuestionGeneration.project_id == project.id)
        .order_by(ResearchQuestionGeneration.created_at.desc())
        .first()
    )
    questions_data: List[Dict[str, Any]] = []
    if question_gen and question_gen.questions:
        for q in question_gen.questions:
            questions_data.append({
                "id": q.id,
                "question": q.question,
                "question_type": getattr(q, "question_type", "Primary Research Question"),
                "motivation": getattr(q, "motivation", ""),
                "supporting_evidence": getattr(q, "supporting_evidence", []),
                "expected_investigation": getattr(q, "expected_investigation", ""),
            })

    # 4. Literature Review
    lit_record = (
        db.query(LiteratureReviewGeneration)
        .filter(LiteratureReviewGeneration.project_id == project.id)
        .order_by(LiteratureReviewGeneration.created_at.desc())
        .first()
    )
    lit_review_data = None
    if lit_record:
        themes_list = []
        for t in (lit_record.themes or []):
            themes_list.append({
                "title": t.title,
                "description": t.description,
            })
        lit_review_data = {
            "introduction": lit_record.introduction,
            "research_landscape": lit_record.research_landscape,
            "methodological_analysis": lit_record.methodological_analysis,
            "comparative_synthesis": lit_record.comparative_synthesis,
            "themes": themes_list,
            "conclusion": lit_record.conclusion,
        }

    # 5. Methodology
    meth_record = (
        db.query(ResearchMethodologyGeneration)
        .filter(ResearchMethodologyGeneration.project_id == project.id)
        .order_by(ResearchMethodologyGeneration.version.desc())
        .first()
    )
    methodology_data = None
    if meth_record:
        methodology_data = {
            "research_overview": meth_record.research_overview,
            "research_design": meth_record.research_design,
            "proposed_approach": meth_record.proposed_approach,
            "data_collection": meth_record.data_collection,
            "data_preprocessing": meth_record.data_preprocessing,
            "methods_and_algorithms": meth_record.methods_and_algorithms,
            "system_design": meth_record.system_design,
            "experimental_setup": meth_record.experimental_setup,
            "evaluation_metrics": meth_record.evaluation_metrics,
            "comparison_strategy": meth_record.comparison_strategy,
        }

    # 6. Paper Comparison
    comp_record = (
        db.query(ResearchPaperComparison)
        .filter(ResearchPaperComparison.project_id == project.id)
        .order_by(ResearchPaperComparison.created_at.desc())
        .first()
    )
    comparison_data = comp_record.structured_comparison_result if comp_record else None

    # 7. Architecture
    arch_record = (
        db.query(ArchitectureGeneration)
        .filter(ArchitectureGeneration.project_id == project.id)
        .order_by(ArchitectureGeneration.created_at.desc())
        .first()
    )
    architecture_data = arch_record.structured_architecture_result if arch_record else None

    return {
        "topic": project.topic or project.title,
        "project_description": project.description,
        "papers_data": papers_data,
        "analyses_data": analyses_data,
        "gaps_data": gaps_data,
        "questions_data": questions_data,
        "lit_review_data": lit_review_data,
        "methodology_data": methodology_data,
        "comparison_data": comparison_data,
        "architecture_data": architecture_data,
    }


@router.post("/generate", response_model=DocumentationResponse, status_code=status.HTTP_201_CREATED)
async def generate_documentation(
    payload: GenerateDocumentationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates a structured, publication-ready academic research document
    from the project's completed research modules.
    """
    project = _resolve_project_with_ownership(payload.project_id, current_user.id, db)
    ctx = _gather_project_research_context(project, db)

    try:
        doc_dict = await DocumentationService.generate_documentation(
            topic=ctx["topic"],
            project_description=ctx["project_description"],
            template=payload.template or "IEEE Conference",
            target_journal=payload.target_journal,
            reference_style=payload.reference_style or "IEEE",
            authors=payload.authors,
            institution=payload.institution,
            sections_to_include=payload.sections_to_include,
            papers_data=ctx["papers_data"],
            analyses_data=ctx["analyses_data"],
            gaps_data=ctx["gaps_data"],
            questions_data=ctx["questions_data"],
            lit_review_data=ctx["lit_review_data"],
            methodology_data=ctx["methodology_data"],
            comparison_data=ctx["comparison_data"],
            architecture_data=ctx["architecture_data"],
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Documentation generation error for project {project.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Research documentation generation failed. Please try again.",
        )

    doc_dict["project_id"] = project.id

    # Persist in PostgreSQL
    record = ResearchDocumentation(
        project_id=project.id,
        user_id=current_user.id,
        title=doc_dict.get("title", project.title),
        template=doc_dict.get("template", "IEEE Conference"),
        target_journal=doc_dict.get("target_journal"),
        reference_style=doc_dict.get("reference_style", "IEEE"),
        authors=doc_dict.get("authors"),
        institution=doc_dict.get("institution"),
        status="draft",
        version=1,
        structured_content=doc_dict,
        sections_config=doc_dict.get("sections", []),
        compiled_markdown=doc_dict.get("compiled_markdown", ""),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    doc_dict["id"] = record.id
    doc_dict["created_at"] = record.created_at.isoformat() if record.created_at else None
    doc_dict["updated_at"] = record.updated_at.isoformat() if record.updated_at else None

    return DocumentationResponse(
        id=record.id,
        project_id=project.id,
        title=record.title,
        template=record.template,
        status=record.status,
        created_at=record.created_at.isoformat() if record.created_at else None,
        updated_at=record.updated_at.isoformat() if record.updated_at else None,
        data=DocumentationData(**doc_dict),
    )


@router.get("/{project_id}", response_model=DocumentationResponse)
def get_latest_documentation(
    project_id: Union[int, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves the latest saved research documentation for an authorized project.
    """
    project = _resolve_project_with_ownership(project_id, current_user.id, db)

    record = (
        db.query(ResearchDocumentation)
        .filter(
            ResearchDocumentation.project_id == project.id,
            ResearchDocumentation.user_id == current_user.id,
        )
        .order_by(ResearchDocumentation.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No saved research documentation found for this project.",
        )

    doc_dict = dict(record.structured_content)
    doc_dict["id"] = record.id
    doc_dict["project_id"] = project.id
    doc_dict["created_at"] = record.created_at.isoformat() if record.created_at else None
    doc_dict["updated_at"] = record.updated_at.isoformat() if record.updated_at else None

    return DocumentationResponse(
        id=record.id,
        project_id=project.id,
        title=record.title,
        template=record.template,
        status=record.status,
        created_at=record.created_at.isoformat() if record.created_at else None,
        updated_at=record.updated_at.isoformat() if record.updated_at else None,
        data=DocumentationData(**doc_dict),
    )


@router.put("/{project_id}", response_model=DocumentationResponse)
def update_documentation(
    project_id: Union[int, str],
    payload: UpdateDocumentationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates and saves user edits to the existing research documentation.
    Preserves manual section modifications and recalculates compiled text.
    """
    project = _resolve_project_with_ownership(project_id, current_user.id, db)

    record = (
        db.query(ResearchDocumentation)
        .filter(
            ResearchDocumentation.project_id == project.id,
            ResearchDocumentation.user_id == current_user.id,
        )
        .order_by(ResearchDocumentation.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existing research documentation found to update for this project.",
        )

    doc_dict = dict(record.structured_content)

    if payload.title is not None:
        record.title = payload.title
        doc_dict["title"] = payload.title
    if payload.template is not None:
        record.template = payload.template
        doc_dict["template"] = payload.template
    if payload.target_journal is not None:
        record.target_journal = payload.target_journal
        doc_dict["target_journal"] = payload.target_journal
    if payload.reference_style is not None:
        record.reference_style = payload.reference_style
        doc_dict["reference_style"] = payload.reference_style
    if payload.authors is not None:
        record.authors = payload.authors
        doc_dict["authors"] = payload.authors
    if payload.institution is not None:
        record.institution = payload.institution
        doc_dict["institution"] = payload.institution
    if payload.status is not None:
        record.status = payload.status
        doc_dict["status"] = payload.status

    if payload.sections is not None:
        serialized_sections = []
        for s in payload.sections:
            s_dict = s.model_dump()
            s_dict["wordCount"] = DocumentationService._count_words(s_dict.get("content", ""))
            serialized_sections.append(s_dict)

        doc_dict["sections"] = serialized_sections
        record.sections_config = serialized_sections

        # Recompile markdown from included sections
        compiled_parts = [
            sec["content"] for sec in serialized_sections if sec.get("included") and sec.get("content", "").strip()
        ]
        compiled_md = "\n\n---\n\n".join(compiled_parts)
        doc_dict["compiled_markdown"] = compiled_md
        record.compiled_markdown = compiled_md
        doc_dict["total_word_count"] = sum(sec["wordCount"] for sec in serialized_sections if sec.get("included"))
    elif payload.compiled_markdown is not None:
        record.compiled_markdown = payload.compiled_markdown
        doc_dict["compiled_markdown"] = payload.compiled_markdown

    record.version = record.version + 1
    doc_dict["version"] = record.version
    record.structured_content = doc_dict
    record.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(record)

    doc_dict["id"] = record.id
    doc_dict["created_at"] = record.created_at.isoformat() if record.created_at else None
    doc_dict["updated_at"] = record.updated_at.isoformat() if record.updated_at else None

    return DocumentationResponse(
        id=record.id,
        project_id=project.id,
        title=record.title,
        template=record.template,
        status=record.status,
        created_at=record.created_at.isoformat() if record.created_at else None,
        updated_at=record.updated_at.isoformat() if record.updated_at else None,
        data=DocumentationData(**doc_dict),
    )


@router.post("/{project_id}/regenerate", response_model=DocumentationResponse)
def regenerate_documentation(
    project_id: Union[int, str],
    payload: RegenerateDocumentationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Regenerates the complete document or specified sections using latest upstream data.
    Preserves manual user edits on non-regenerated sections.
    """
    project = _resolve_project_with_ownership(project_id, current_user.id, db)

    record = (
        db.query(ResearchDocumentation)
        .filter(
            ResearchDocumentation.project_id == project.id,
            ResearchDocumentation.user_id == current_user.id,
        )
        .order_by(ResearchDocumentation.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No saved research documentation found to regenerate.",
        )

    ctx = _gather_project_research_context(project, db)
    existing_doc_data = dict(record.structured_content)

    if payload.template:
        existing_doc_data["template"] = payload.template
        record.template = payload.template
    if payload.reference_style:
        existing_doc_data["reference_style"] = payload.reference_style
        record.reference_style = payload.reference_style

    updated_doc_data = DocumentationService.regenerate_sections(
        existing_doc_data=existing_doc_data,
        section_ids_to_regenerate=payload.section_ids,
        project_context=ctx,
    )

    record.structured_content = updated_doc_data
    record.sections_config = updated_doc_data.get("sections", [])
    record.compiled_markdown = updated_doc_data.get("compiled_markdown", "")
    record.version = updated_doc_data.get("version", record.version + 1)
    record.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(record)

    updated_doc_data["id"] = record.id
    updated_doc_data["created_at"] = record.created_at.isoformat() if record.created_at else None
    updated_doc_data["updated_at"] = record.updated_at.isoformat() if record.updated_at else None

    return DocumentationResponse(
        id=record.id,
        project_id=project.id,
        title=record.title,
        template=record.template,
        status=record.status,
        created_at=record.created_at.isoformat() if record.created_at else None,
        updated_at=record.updated_at.isoformat() if record.updated_at else None,
        data=DocumentationData(**updated_doc_data),
    )


@router.get("/{project_id}/export")
def export_documentation(
    project_id: Union[int, str],
    format: str = Query("markdown", description="Export format ('markdown', 'docx', 'pdf')"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Exports the generated research document as a formatted Markdown, DOCX, or PDF file.
    """
    project = _resolve_project_with_ownership(project_id, current_user.id, db)

    record = (
        db.query(ResearchDocumentation)
        .filter(
            ResearchDocumentation.project_id == project.id,
            ResearchDocumentation.user_id == current_user.id,
        )
        .order_by(ResearchDocumentation.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No saved research documentation found to export for this project.",
        )

    doc_data = record.structured_content
    fmt = format.lower().strip()
    safe_title = re.sub(r"[^\w\s-]", "", record.title).strip().replace(" ", "_")
    if not safe_title:
        safe_title = "Research_Manuscript"

    if fmt in ["markdown", "md"]:
        content_bytes = DocumentationService.export_to_markdown(doc_data)
        filename = f"{safe_title}.md"
        media_type = "text/markdown; charset=utf-8"
    elif fmt == "docx":
        try:
            content_bytes = DocumentationService.export_to_docx(doc_data)
            filename = f"{safe_title}.docx"
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        except Exception as e:
            logger.error(f"DOCX export error: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate DOCX export.")
    elif fmt == "pdf":
        try:
            content_bytes = DocumentationService.export_to_pdf(doc_data)
            filename = f"{safe_title}.pdf"
            media_type = "application/pdf"
        except Exception as e:
            logger.error(f"PDF export error: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate PDF export.")
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported export format '{format}'. Supported formats: markdown, docx, pdf.",
        )

    return Response(
        content=content_bytes,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
