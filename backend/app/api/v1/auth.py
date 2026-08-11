from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from app.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserRegister, UserResponse, TokenResponse, TokenRefreshRequest
from app.services.auth_service import AuthService

router = APIRouter()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    return await AuthService.register_user(db, user_in)

@router.post("/login", response_model=TokenResponse)
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    return await AuthService.login_user(db, login_in.email, login_in.password)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_in: TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService.refresh_tokens(db, refresh_in.refresh_token)

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(refresh_in: TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    await AuthService.logout_user(db, refresh_in.refresh_token)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
