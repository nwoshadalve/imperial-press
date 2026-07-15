from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.modules.users.models import User

TEST_DB_URL = "postgresql+asyncpg://test:test@localhost:5432/imperial_test"


@pytest_asyncio.fixture(scope="session")
async def engine():
    e = create_async_engine(TEST_DB_URL)
    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield e
    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await e.dispose()


@pytest_asyncio.fixture
async def session(engine):
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as s:
        yield s
        await s.rollback()


@pytest_asyncio.fixture
async def client(session: AsyncSession):
    async def _override_get_db():
        yield session

    app.dependency_overrides[get_db] = _override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


async def create_test_user(
    session: AsyncSession,
    email: str = "test@example.com",
    password: str = "ValidPass1!",
    roles: list[str] | None = None,
    full_name: str = "Test User",
) -> User:
    """Helper to seed a user directly into the test DB."""
    if roles is None:
        roles = ["author"]
    hashed = hash_password(password)
    user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed,
        roles=roles,
        is_active=True,
    )
    session.add(user)
    await session.flush()
    return user
