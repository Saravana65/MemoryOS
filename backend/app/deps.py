from typing import AsyncGenerator
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import async_session_maker
from app.core.security import ALGORITHM
from app.exceptions import UnauthorizedException
from app.models.user import User

security_scheme = HTTPBearer()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

async def get_current_user(
    token_credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = token_credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise UnauthorizedException("Invalid access token")
    except JWTError:
        raise UnauthorizedException("Could not validate token")
    
    # Try importing UUID to make sure string user_id matches User.id format
    import uuid
    try:
        uuid_user_id = uuid.UUID(user_id)
    except ValueError:
        raise UnauthorizedException("Invalid token claims")

    result = await db.execute(select(User).where(User.id == uuid_user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise UnauthorizedException("User not found")
    if not user.is_active:
        raise UnauthorizedException("User account is disabled")
    
    return user
