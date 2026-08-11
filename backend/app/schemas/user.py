import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None

class UserRegister(UserBase):
    password: str = Field(..., min_length=8, max_length=128)

class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    is_verified: bool
    plan: str
    storage_used_bytes: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefreshRequest(BaseModel):
    refresh_token: str
