from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import get_user_by_id


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
) -> User:
    """Extracts the active user identity from the X-User-Id header for the prototype.

    Defaults to 'user-sarah' if omitted.
    """
    user_id = x_user_id or "user-sarah"
    user = get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError(
            f"User with ID '{user_id}' does not exist in the directory."
        )
    return user
