from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    TokenResponse,
    CurrentUserResponse,
    MessageResponse,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Registers a new user account with validated email, name, and securely hashed password.",
    responses={
        201: {"description": "User created successfully"},
        400: {"description": "Validation error"},
        409: {"description": "Email already exists"},
    },
)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user, token = AuthService.register_user(db, req)
    user_res = UserResponse.model_validate(user)
    return RegisterResponse(
        message="Account created successfully",
        token=token,
        access_token=token,
        token_type="bearer",
        user=user_res,
    )


# Alias /signup for existing frontend compatibility
@router.post(
    "/signup",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def signup_alias(req: RegisterRequest, db: Session = Depends(get_db)):
    return register(req, db)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT token",
    description="Validates user credentials and issues a JWT bearer token.",
    responses={
        200: {"description": "Authentication successful"},
        401: {"description": "Invalid email or password"},
    },
)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user, token = AuthService.login_user(db, req)
    user_res = UserResponse.model_validate(user)
    return TokenResponse(
        access_token=token,
        token=token,
        token_type="bearer",
        message="Signed in successfully.",
        user=user_res,
    )


# Alias /signin for existing frontend compatibility
@router.post(
    "/signin",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def signin_alias(req: LoginRequest, db: Session = Depends(get_db)):
    return login(req, db)


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
    description="Retrieves the profile of the user identified by the supplied JWT Bearer token.",
    responses={
        200: {"description": "Profile data for current user"},
        401: {"description": "Unauthenticated or invalid token"},
    },
)
def get_me(current_user: User = Depends(get_current_user)):
    user_res = UserResponse.model_validate(current_user)
    return CurrentUserResponse(
        id=user_res.id,
        full_name=user_res.full_name,
        email=user_res.email,
        created_at=user_res.created_at,
        user=user_res,
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Log out current session",
    description="Confirms session termination. Stateless JWT tokens should be discarded on client side.",
)
def logout():
    return MessageResponse(message="Logged out successfully.")
