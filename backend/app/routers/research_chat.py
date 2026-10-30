import os
import shutil
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.models.project import ResearchProject
from app.services.agentic_rag_graph import AgenticRAGPipeline
from app.services.project_ingestion_service import ProjectIngestionService
from app.services.rag_vector_store import rag_vector_store

logger = logging.getLogger("research_chat_router")
logger.setLevel(logging.INFO)

router = APIRouter()

# In-memory conversation store keyed by (user_id, project_id, conversation_id)
# Conforming to Section 10: "Keep conversation history isolated by user, project, and conversation identifier"
_CONVERSATION_HISTORY: Dict[str, List[Dict[str, str]]] = {}


def _get_history_key(user_id: int, project_id: int, conversation_id: str) -> str:
    return f"{user_id}_{project_id}_{conversation_id}"


class ResearchQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=2500, description="Research question or paper inquiry")
    project_id: Optional[int] = Field(None, description="Active research project ID for isolation")
    conversation_id: Optional[str] = Field("default", description="Conversation session identifier")


class IndexProjectRequest(BaseModel):
    project_id: Optional[int] = Field(None, description="Active research project ID to index")


@router.post("/query", summary="Query Agentic RAG Chatbot")
async def query_research_chatbot(
    req: ResearchQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/research-chat/query
    Accepts question, active project ID, and conversation identifier.
    Validates user authorization, checks domain relevance, retrieves evidence strictly from
    the project's indexed documents, runs the Agentic RAG workflow, and returns grounded answers
    with valid citations and telemetry.
    """
    # 1. Authorize and resolve project
    project = None
    if req.project_id:
        project = db.query(ResearchProject).filter(
            ResearchProject.id == req.project_id,
            ResearchProject.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research project not found or you are not authorized to access it."
            )

    if not project:
        # Default to latest active project for current user
        project = (
            db.query(ResearchProject)
            .filter(ResearchProject.user_id == current_user.id)
            .order_by(ResearchProject.updated_at.desc())
            .first()
        )

    project_id = project.id if project else 0
    project_topic = project.topic if project else ""
    conv_id = req.conversation_id or "default"

    # 2. Retrieve isolated conversation history
    h_key = _get_history_key(current_user.id, project_id, conv_id)
    history = _CONVERSATION_HISTORY.setdefault(h_key, [])

    # 3. Execute Agentic RAG Pipeline
    result = await AgenticRAGPipeline.execute(
        query=req.query,
        project_id=project_id,
        user_id=current_user.id,
        project_topic=project_topic,
        conversation_id=conv_id,
        history=history,
    )

    # 4. Record to conversation history if inquiry was processed
    history.append({"role": "user", "content": req.query})
    history.append({"role": "assistant", "content": result.get("answer", "")})

    # Limit history depth to 16 turns to avoid memory bloating
    if len(history) > 16:
        _CONVERSATION_HISTORY[h_key] = history[-16:]

    return {
        "status": result.get("status", "success"),
        "project_id": project_id,
        "conversation_id": conv_id,
        "is_valid_research": result.get("is_valid_research", True),
        "answer": result.get("answer", ""),
        "citations": result.get("citations", []),
        "telemetry": result.get("telemetry", {}),
    }


@router.post("/index", summary="Index Active Project Corpus into ChromaDB")
async def index_project_corpus(
    req: IndexProjectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/research-chat/index
    Indexes all authorized research papers, abstracts, analyses, gaps, and literature
    reviews associated with the active project into ChromaDB. Avoids duplicate indexing.
    """
    project = None
    if req.project_id:
        project = db.query(ResearchProject).filter(
            ResearchProject.id == req.project_id,
            ResearchProject.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research project not found or unauthorized."
            )

    if not project:
        project = (
            db.query(ResearchProject)
            .filter(ResearchProject.user_id == current_user.id)
            .order_by(ResearchProject.updated_at.desc())
            .first()
        )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active research project found to index. Please create or select a project first."
        )

    try:
        index_res = ProjectIngestionService.index_project_corpus(
            project_id=project.id,
            user_id=current_user.id,
            db=db,
        )
        return {
            "status": "success",
            "message": f"Successfully indexed {index_res.get('chunks_indexed', 0)} chunks across {index_res.get('papers_found', 0)} papers.",
            "data": index_res,
        }
    except Exception as e:
        logger.error(f"Project indexing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Indexing failed: {str(e)}"
        )


@router.get("/status", summary="Get Vector Store & Indexing Status")
async def get_research_chat_status(
    project_id: Optional[int] = Query(None, description="Active project ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/research-chat/status
    Returns indexing and vector-store status for the authorized active project.
    """
    target_project_id = project_id
    if not target_project_id:
        proj = (
            db.query(ResearchProject)
            .filter(ResearchProject.user_id == current_user.id)
            .order_by(ResearchProject.updated_at.desc())
            .first()
        )
        target_project_id = proj.id if proj else 0

    status_data = rag_vector_store.get_status(target_project_id)
    return {
        "status": "success",
        "data": status_data,
    }


@router.get("/history", summary="Get Conversation History")
async def get_conversation_history(
    project_id: Optional[int] = Query(None, description="Active project ID"),
    conversation_id: str = Query("default", description="Conversation ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/research-chat/history
    Retrieves isolated conversation history for the authorized user and project.
    """
    target_project_id = project_id or 0
    h_key = _get_history_key(current_user.id, target_project_id, conversation_id)
    history = _CONVERSATION_HISTORY.get(h_key, [])
    return {
        "status": "success",
        "project_id": target_project_id,
        "conversation_id": conversation_id,
        "history": history,
    }


@router.delete("/history", summary="Clear Conversation History")
async def clear_conversation_history(
    project_id: Optional[int] = Query(None, description="Active project ID"),
    conversation_id: str = Query("default", description="Conversation ID"),
    current_user: User = Depends(get_current_user),
):
    """
    DELETE /api/research-chat/history
    Clears conversation history for the active session.
    """
    target_project_id = project_id or 0
    h_key = _get_history_key(current_user.id, target_project_id, conversation_id)
    _CONVERSATION_HISTORY.pop(h_key, None)
    return {
        "status": "success",
        "message": "Conversation history cleared successfully.",
    }


@router.post("/upload-pdf", summary="Upload and Index Research Paper PDF")
async def upload_pdf_and_index(
    file: UploadFile = File(...),
    paper_title: str = Form(...),
    project_id: Optional[int] = Form(None),
    authors: Optional[str] = Form(None),
    publication_year: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Uploads a research paper PDF file and extracts text page-by-page using PyMuPDF,
    preserving exact page numbers and indexing semantic chunks into ChromaDB.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files (.pdf) are supported for document extraction."
        )

    # Validate project
    target_project_id = project_id
    if target_project_id:
        proj = db.query(ResearchProject).filter(
            ResearchProject.id == target_project_id,
            ResearchProject.user_id == current_user.id
        ).first()
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized.")
    else:
        proj = (
            db.query(ResearchProject)
            .filter(ResearchProject.user_id == current_user.id)
            .order_by(ResearchProject.updated_at.desc())
            .first()
        )
        target_project_id = proj.id if proj else 0

    # Save uploaded file to temp directory
    upload_dir = os.path.abspath("./backend/storage/uploads")
    os.makedirs(upload_dir, exist_ok=True)
    temp_path = os.path.join(upload_dir, f"upload_{current_user.id}_{file.filename}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Ingest PDF page-by-page
        res = ProjectIngestionService.index_pdf_file(
            file_path=temp_path,
            paper_title=paper_title,
            project_id=target_project_id,
            user_id=current_user.id,
            authors=authors,
            publication_year=publication_year,
        )
        return {
            "status": "success",
            "message": f"Successfully indexed {res.get('chunks_indexed')} chunks across {res.get('total_pages')} pages.",
            "data": res,
        }
    except Exception as e:
        logger.error(f"PDF upload and ingestion failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF ingestion failed: {str(e)}")
    finally:
        # Clean up temporary upload file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
