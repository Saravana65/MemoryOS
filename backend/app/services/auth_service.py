import hashlib
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, ALGORITHM
from app.exceptions import BadRequestException, UnauthorizedException
from app.models.user import User, RefreshToken
from app.schemas.user import UserRegister, TokenResponse

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

class AuthService:
    @staticmethod
    async def register_user(db: AsyncSession, user_in: UserRegister) -> User:
        result = await db.execute(select(User).where(User.email == user_in.email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise BadRequestException("A user with this email already exists.")
        
        hashed_password = get_password_hash(user_in.password)
        new_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            is_active=True,
            is_verified=False,
            plan="free",
            storage_used_bytes=0
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    @staticmethod
    async def login_user(db: AsyncSession, email: str, password: str) -> TokenResponse:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Incorrect email or password.")
        
        if not user.is_active:
            raise UnauthorizedException("User account is disabled.")

        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        
        token_hash = hash_token(refresh_token)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        db_refresh_token = RefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            revoked=False
        )
        db.add(db_refresh_token)
        await db.commit()

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )

    @staticmethod
    async def refresh_tokens(db: AsyncSession, refresh_token: str) -> TokenResponse:
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            token_type: str = payload.get("type")
            if user_id is None or token_type != "refresh":
                raise UnauthorizedException("Invalid refresh token.")
        except JWTError:
            raise UnauthorizedException("Invalid refresh token.")

        token_hash = hash_token(refresh_token)
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked == False
            )
        )
        db_refresh_token = result.scalar_one_or_none()
        if not db_refresh_token:
            raise UnauthorizedException("Refresh token is invalid or revoked.")
        
        # Check expiry
        expires_at = db_refresh_token.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        if expires_at < datetime.now(timezone.utc):
            raise UnauthorizedException("Refresh token has expired.")

        # Check user active
        user_result = await db.execute(select(User).where(User.id == db_refresh_token.user_id))
        user = user_result.scalar_one_or_none()
        if not user or not user.is_active:
            raise UnauthorizedException("User is inactive or not found.")

        # Generate new tokens
        new_access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)
        
        # Invalidate old refresh token
        db_refresh_token.revoked = True
        
        # Save new refresh token in DB
        new_token_hash = hash_token(new_refresh_token)
        new_expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        db_new_refresh_token = RefreshToken(
            user_id=user.id,
            token_hash=new_token_hash,
            expires_at=new_expires_at,
            revoked=False
        )
        
        db.add(db_new_refresh_token)
        await db.commit()

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token
        )

    @staticmethod
    async def logout_user(db: AsyncSession, refresh_token: str) -> None:
        token_hash = hash_token(refresh_token)
        result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        db_refresh_token = result.scalar_one_or_none()
        if db_refresh_token:
            db_refresh_token.revoked = True
            await db.commit()
