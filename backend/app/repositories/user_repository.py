from collections.abc import Sequence

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.group import Group
from app.models.user import User
from app.models.user_group_map import UserGroupMap
from app.schemas.user import DirectorySearchItem


def get_user_by_id(db: Session, user_id: str) -> User | None:
    return (
        db.execute(
            select(User)
            .options(joinedload(User.group_memberships).joinedload(UserGroupMap.group))
            .where(User.id == user_id)
        )
        .unique()
        .scalar_one_or_none()
    )


def get_user_group_ids(db: Session, user_id: str) -> list[str]:
    return list(
        db.execute(select(UserGroupMap.group_id).where(UserGroupMap.user_id == user_id))
        .scalars()
        .all()
    )


def get_group_members(db: Session, group_id: str) -> Sequence[User]:
    return (
        db.execute(
            select(User)
            .join(UserGroupMap, UserGroupMap.user_id == User.id)
            .where(UserGroupMap.group_id == group_id)
        )
        .scalars()
        .all()
    )


def get_all_users(db: Session) -> Sequence[User]:
    return (
        db.execute(
            select(User)
            .options(joinedload(User.group_memberships).joinedload(UserGroupMap.group))
            .order_by(User.name)
        )
        .unique()
        .scalars()
        .all()
    )


def get_all_groups(db: Session) -> Sequence[Group]:
    return db.execute(select(Group).order_by(Group.name)).scalars().all()


def search_directory(db: Session, query: str = "") -> list[DirectorySearchItem]:
    clean_q = f"%{query.strip()}%" if query.strip() else "%"
    results: list[DirectorySearchItem] = []

    # Search Groups first
    groups = (
        db.execute(
            select(Group)
            .where(or_(Group.name.ilike(clean_q), Group.description.ilike(clean_q)))
            .order_by(Group.name)
            .limit(10)
        )
        .scalars()
        .all()
    )

    for g in groups:
        results.append(
            DirectorySearchItem(
                id=g.id,
                name=g.name,
                email=g.email,
                type="GROUP",
                details=g.description or "Security / Microsoft 365 Group",
            )
        )

    # Search Users
    users = (
        db.execute(
            select(User)
            .where(
                or_(
                    User.name.ilike(clean_q),
                    User.email.ilike(clean_q),
                    User.department.ilike(clean_q),
                )
            )
            .order_by(User.name)
            .limit(15)
        )
        .scalars()
        .all()
    )

    for u in users:
        results.append(
            DirectorySearchItem(
                id=u.id,
                name=u.name,
                email=u.email,
                type="USER",
                details=f"{u.role} • {u.department}",
            )
        )

    return results
