import os
import logging
import asyncio

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, select
from datetime import datetime
from typing import List
import json

from database import get_session
from models import Job, Thumbnail
from auth import get_current_user, AuthUser

from services.generator import process_job, STYLE_ORDER
from services.imagekit_service import upload_file, get_variants

from io import BytesIO
from PIL import Image

# logging
logger = logging.getLogger(__name__)

# api router
router = APIRouter(prefix="/api")

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp"}

# health check endpoint
@router.get("/health")
async def health_check():
    return {
        "status": "operational",
        "service": "Thumbnail Generator API",
        "timestamp": datetime.utcnow().isoformat()
    }

# upload headshot endpoint (authenticated)
@router.post("/upload-headshot")
async def upload_headshot(
    file: UploadFile = File(...),
    current_user: AuthUser = Depends(get_current_user)
):
    filename = file.filename or "headshot.png"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    content_type = file.content_type or "image/png"
    if content_type.lower() not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MIME type '{content_type}'. Must be image/png, image/jpeg, or image/webp."
        )

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum allowed limit of 10MB."
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    # Validate image integrity using Pillow
    try:
        with Image.open(BytesIO(contents)) as img:
            img.verify()
    except Exception as img_err:
        logger.warning(f"Uploaded file failed image verification: {img_err}")
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid or readable image."
        )

    url = upload_file(
         files_bytes = contents,
         file_name = filename,
         content_type = content_type,
         folder="headshots"
    )
    return {"url": url}

# *********request response schemas*********

# create job request schema 
class CreateJobRequest(BaseModel):
    prompt: str
    headshot_url: str
    num_thumbnails: int = 1

# create job response schema
class CreateJobResponse(BaseModel):
    job_id: str

# thumbnail response schema
class ThumbnailResponse(BaseModel):
    id: str
    style_name: str
    status: str
    imagekit_url: str | None = None
    error_message: str | None = None
    variants: dict[str, str] | None = None

# job response schema
class JobResponse(BaseModel):
    id: str
    prompt: str | None = None
    headshot_url: str | None = None
    num_thumbnails: int
    status: str
    created_at: datetime
    thumbnails: List[ThumbnailResponse]


# create job endpoint (authenticated, assigns job to current_user.id)
@router.post("/jobs", response_model=CreateJobResponse)
async def create_job(
    request: CreateJobRequest,
    current_user: AuthUser = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    logger.info(f"POST /api/jobs received from user {current_user.id}: prompt='{request.prompt}', headshot_url='{request.headshot_url}', num_thumbnails={request.num_thumbnails}")

    # validate the num_thumbnails
    if request.num_thumbnails < 1 or request.num_thumbnails > 3:
        logger.warning(f"Validation failed: num_thumbnails={request.num_thumbnails} (must be between 1 and 3)")
        raise HTTPException(status_code=400, detail="num_thumbnails must be between 1 and 3")

    # validate headshot_url
    headshot_url = (request.headshot_url or "").strip()
    if not (headshot_url.startswith("http://") or headshot_url.startswith("https://")):
        logger.warning(f"Validation failed: headshot_url='{request.headshot_url}' is not a valid http/https URL")
        raise HTTPException(
            status_code=400,
            detail="headshot_url must be a valid URL starting with 'http://' or 'https://'"
        )

    # create a new job belonging to authenticated user
    job = Job(
        user_id=current_user.id,
        prompt=request.prompt,
        headshot_url=headshot_url,
        num_thumbnails=request.num_thumbnails
    )
    session.add(job)

    # get no. of styles for thumbnails based on the num_thumbnails req
    styles = STYLE_ORDER[:request.num_thumbnails]  
    
    # create a new thumbnail for each style
    for style in styles:
        thumb = Thumbnail(
            job_id=job.id,
            style_name=style
        )
        session.add(thumb)

    session.commit()

    # fire and forget style of generation
    asyncio.create_task(process_job(job.id))

    return CreateJobResponse(job_id=job.id)


# get job details from job id (authenticated, checks ownership)
@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    current_user: AuthUser = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    job = session.get(Job, job_id)
    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # get all thumbnails for the job
    thumbnails = (
        session.exec(
            select(Thumbnail).where(Thumbnail.job_id == job_id)
        )
    ).all()
    
    # generate image variants using imagekit api
    thumb_responses = []
    for t in thumbnails:
        variants = get_variants(t.imagekit_url) if t.imagekit_url else None

        thumb_responses.append(ThumbnailResponse(
            id=t.id,
            style_name=t.style_name,
            status=t.status,
            imagekit_url=t.imagekit_url,
            error_message=t.error_message,
            variants=variants
        ))

    return JobResponse(
        id=job.id,
        prompt=job.prompt,
        headshot_url=job.headshot_url,
        num_thumbnails=job.num_thumbnails,
        status=job.status,
        created_at=job.created_at,
        thumbnails=thumb_responses
    )

# get authenticated user's job history (ordered newest first)
@router.get("/history", response_model=List[JobResponse])
async def get_history(
    current_user: AuthUser = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    jobs = session.exec(
        select(Job)
        .where(Job.user_id == current_user.id)
        .order_by(Job.created_at.desc())
    ).all()

    results = []
    for job in jobs:
        thumbnails = session.exec(
            select(Thumbnail).where(Thumbnail.job_id == job.id)
        ).all()

        thumb_responses = []
        for t in thumbnails:
            variants = get_variants(t.imagekit_url) if t.imagekit_url else None
            thumb_responses.append(ThumbnailResponse(
                id=t.id,
                style_name=t.style_name,
                status=t.status,
                imagekit_url=t.imagekit_url,
                error_message=t.error_message,
                variants=variants
            ))

        results.append(JobResponse(
            id=job.id,
            prompt=job.prompt,
            headshot_url=job.headshot_url,
            num_thumbnails=job.num_thumbnails,
            status=job.status,
            created_at=job.created_at,
            thumbnails=thumb_responses
        ))

    return results

# stream job details -> The backend will keep this connection open and continuously send updates.
@router.get("/jobs/{job_id}/stream")
async def stream_job(
    job_id: str,
    current_user: AuthUser = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Verify ownership upfront
    initial_job = session.get(Job, job_id)
    if not initial_job or initial_job.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        from database import engine
        sent_thumbnails = set()
        while True:
            events_to_send = []
            job_complete_event = None

            with Session(engine) as db_session:
                job = db_session.get(Job, job_id)
                if not job or job.user_id != current_user.id:
                    error_data = json.dumps({"error": "Job not found"})
                    yield f"event: error\ndata: {error_data}\n\n"
                    return

                thumbnails = db_session.exec(
                    select(Thumbnail).where(Thumbnail.job_id == job_id)
                ).all()

                for t in thumbnails:
                    if t.id in sent_thumbnails:
                        continue
                    if t.status == "uploaded":
                        variants = get_variants(t.imagekit_url) if t.imagekit_url else None
                        events_to_send.append(("thumbnail_ready", {
                            "thumbnail_id": t.id,
                            "style_name": t.style_name,
                            "imagekit_url": t.imagekit_url,
                            "variants": variants,
                        }))
                        sent_thumbnails.add(t.id)
                    elif t.status == "failed":
                        events_to_send.append(("thumbnail_failed", {
                            "thumbnail_id": t.id,
                            "style_name": t.style_name,
                            "error_message": t.error_message,
                        }))
                        sent_thumbnails.add(t.id)

                all_done = len(thumbnails) > 0 and all(t.status in ["uploaded", "failed"] for t in thumbnails)
                if all_done and len(sent_thumbnails) == len(thumbnails):
                    all_failed = all(t.status == "failed" for t in thumbnails)
                    final_status = "failed" if all_failed else "completed"
                    job_complete_event = {
                        "job_id": job.id,
                        "status": final_status
                    }

            # Database session is closed before sending events and awaiting sleep
            for event_name, payload in events_to_send:
                yield f"event: {event_name}\ndata: {json.dumps(payload)}\n\n"

            if job_complete_event:
                yield f"event: job_completed\ndata: {json.dumps(job_complete_event)}\n\n"
                return

            await asyncio.sleep(1.0)   

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
    
