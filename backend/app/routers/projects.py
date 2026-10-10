from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.models.project import ResearchProject
from app.schemas.project import ProjectCreateRequest, ProjectResponse

router = APIRouter()


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Research Project",
    description="Creates a research project for the authenticated user in PostgreSQL.",
)
def create_project(
    req: ProjectCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = ResearchProject(
        user_id=current_user.id,
        title=req.title.strip(),
        topic=req.topic.strip() if req.topic else None,
        description=req.description,
        domain=req.domain,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get(
    "",
    response_model=List[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="List User Research Projects",
    description="Lists all research projects owned by the authenticated user.",
)
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ResearchProject)
        .filter(ResearchProject.user_id == current_user.id)
        .order_by(ResearchProject.created_at.desc())
        .all()
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Research Project",
    description="Retrieves a specific research project owned by the authenticated user.",
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research project {project_id} not found.",
        )
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this project.",
        )
    return project
