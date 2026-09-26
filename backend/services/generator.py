import asyncio
import logging

from sqlmodel import Session, select
from database import engine
from models import Thumbnail, Job
from services.huggingface_service import generate_thumbnail
from services.imagekit_service import upload_files


# logging -> Used to record what is happening in your backend.
logger = logging.getLogger(__name__)


# styles for generating thumbnails
STYLES = {
    "bold_dramatic": (
        "Create a bold, dramatic YouTube thumbnail with high contrast, "
        "cinematic lighting, dark moody background, and powerful composition. "
        "The person's face should be prominent with a dramatic expression."
    ),
    "clean_minimal": (
        "Create a clean, minimal YouTube thumbnail with bright lighting, "
        "white/light background, modern professional aesthetic, plenty of "
        "whitespace, and sharp clean composition. The person should look "
        "approachable and professional."
    ),
    "vibrant_energetic": (
        "Create a vibrant, energetic YouTube thumbnail with colorful gradients, "
        "dynamic angles, eye-catching pop-art style colors, and energetic "
        "composition. The person should have an excited or engaging expression."
    ),
}

# order in which styles should be generated
STYLE_ORDER = [
    "bold_dramatic",
    "clean_minimal",
    "vibrant_energetic",
]

#generate single thumbnail
async def generate_single_thumbnail(thumbnail_id: str, prompt: str, headshot_url: str):
    """Generate a single thumbnail for the given thumbnail ID"""

    # first mark the status of the thumbnail as generating in database
    with Session(engine) as session:
        thumb = session.get(Thumbnail, thumbnail_id)
        if not thumb:
            return
        thumb.status="generating"
        style_name=thumb.style_name
        session.add(thumb)
        session.commit()

    # get style prompt based on the thumbnail name
    style_prompt = STYLES[style_name]

    # AI call to generate image
    try:
        image_bytes = await generate_thumbnail(prompt, style_prompt, headshot_url)
        with Session(engine) as session:
            thumb=session.get(Thumbnail, thumbnail_id)
            job_id=thumb.job_id

        # after generating the image, upload this image to imagekit server
        url=upload_files(
            files_bytes=image_bytes,
            file_name=f"{thumbnail_id}.png",
            folder=f"thumbnails/{job_id}/"
        )
        
        # DB call  save the url + mark uploaded
        with Session(engine) as session:
            thumb=session.get(Thumbnail, thumbnail_id)
            thumb.imagekit_url = url
            thumb.status = "uploaded"
            session.add(thumb)
            session.commit()
        logger.info(f"Thumbnail {thumbnail_id} generated and uploaded successfully.")

    # incase of failure mark as failed
    except Exception as e:
        logger.error(f"Error generating thumbnail {thumbnail_id}: {str(e)}")
        with Session(engine) as session:
            thumb=session.get(Thumbnail, thumbnail_id)
            thumb.status = "failed"
            thumb.error_message = str(e)[:500]
            session.add(thumb)
            session.commit()  #singke thumbnail is generated or failed we update the data in database

async def process_job(job_id: str): 
    """Process a job for generating thumbnails""" 

    # 1. Open session, read job, update status to processing, read thumbnail IDs, commit & close session
    with Session(engine) as session:
        job = session.get(Job, job_id)
        if not job:
            logger.warning(f"Job {job_id} not found in process_job")
            return
        job.status = "processing"
        prompt = job.prompt or ""
        headshot_url = job.headshot_url or ""
        session.add(job)
        session.commit()
        
        thumbnails = session.exec(
            select(Thumbnail).where(Thumbnail.job_id == job_id)   
        ).all()
        thumbnails_ids = [t.id for t in thumbnails]

    # Session is closed during asynchronous thumbnail generation
    tasks = [
        generate_single_thumbnail(tid, prompt, headshot_url)
        for tid in thumbnails_ids
    ]
    await asyncio.gather(*tasks, return_exceptions=True)

    # 2. Open a new session, check results, update final job status, commit & close session
    with Session(engine) as session:
        thumbnails = session.exec(
            select(Thumbnail).where(Thumbnail.job_id == job_id)   
        ).all()
        all_failed = len(thumbnails) > 0 and all(t.status == "failed" for t in thumbnails)
        job = session.get(Job, job_id)
        if job:
            job.status = "failed" if all_failed else "completed"
            session.add(job)
            session.commit()
            
            
    

    




# generate_single_thumbnail()
#           │
#           ▼
# 1. Fetch Thumbnail record from DB
#           │
#           ▼
# 2. Mark status = "generating"
#           │
#           ▼
# 3. Call OpenAI service
#           │
#           ▼
# 4. Receive image bytes
#           │
#           ▼
# 5. Upload image bytes to ImageKit
#           │
#           ▼
# 6. Receive ImageKit URL
#           │
#           ▼
# 7. Save URL in Thumbnail table
#           │
#           ▼
# 8. Mark status = "uploaded"