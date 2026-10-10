from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserProfileUpdate

router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user details",
)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put(
    "/profile",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user profile",
)
def update_user_profile(
    req: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.full_name is not None:
        current_user.full_name = req.full_name.strip()
        db.add(current_user)
        db.commit()
        db.refresh(current_user)

    return UserResponse.model_validate(current_user)
