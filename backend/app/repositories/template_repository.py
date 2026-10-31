from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate


def get_active_templates(db: Session) -> Sequence[Template]:
    return (
        db.execute(
            select(Template)
            .where(Template.is_active.is_(True))
            .order_by(Template.category, Template.name)
        )
        .scalars()
        .all()
    )


def get_template_by_id(db: Session, template_id: int) -> Template | None:
    return db.execute(
        select(Template).where(Template.id == template_id)
    ).scalar_one_or_none()


def create_template(db: Session, data: TemplateCreate) -> Template:
    template = Template(
        name=data.name,
        category=data.category,
        title_template=data.title_template,
        content_template=data.content_template,
        is_active=data.is_active,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def update_template(db: Session, template: Template, data: TemplateUpdate) -> Template:
    if data.name is not None:
        template.name = data.name
    if data.category is not None:
        template.category = data.category
    if data.title_template is not None:
        template.title_template = data.title_template
    if data.content_template is not None:
        template.content_template = data.content_template
    if data.is_active is not None:
        template.is_active = data.is_active

    db.commit()
    db.refresh(template)
    return template
