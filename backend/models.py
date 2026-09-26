from datetime import datetime, timezone
from typing import Optional, List
from uuid import uuid4


from sqlmodel import Field, SQLModel, Relationship

def _uuid() -> str:
    return str(uuid4())

def now() -> datetime:
    return datetime.now(timezone.utc)

class Thumbnail(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    job_id: str = Field(foreign_key="job.id")
    style_name: str = Field(default="")
    status: str = Field(default="pending")
    imagekit_url: Optional[str] = Field(default=None)
    error_message: Optional[str] = Field(default=None)

    job: Optional["Job"] = Relationship(back_populates="thumbnails")


class Job(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: Optional[str] = Field(default=None, index=True)
    prompt: Optional[str] = Field(default=None)
    headshot_url: Optional[str] = Field(default=None)
    num_thumbnails: int = Field(default=1)
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=now)

    thumbnails: List[Thumbnail] = Relationship(back_populates="job")



    