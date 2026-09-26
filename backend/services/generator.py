import asyncio
import logging

from sqlmodel import Session, select
from database import engine
from models import Thumbnail, Job
from services.cloudflare_service import generate_image
from services.imagekit_service import upload_files


logger = logging.getLogger(__name__)


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


STYLE_ORDER = [
    "bold_dramatic",
    "clean_minimal",
    "vibrant_energetic",
]


async def generate_single_thumbnail(
    thumbnail_id: str,
    prompt: str,
    headshot_url: str
):
    with Session(engine) as session:
        thumb = session.get(Thumbnail, thumbnail_id)

        if not thumb:
            return

        thumb.status = "generating"
        style_name = thumb.style_name

        session.add(thumb)
        session.commit()

    style_prompt = STYLES[style_name]

    try:
        combined_prompt = f"""
{style_prompt}

YouTube thumbnail topic:
{prompt}

Create a professional, eye-catching YouTube thumbnail.

Use strong visual hierarchy, clear subject focus, high contrast,
and a composition suitable for a YouTube thumbnail.

Do not add large paragraphs of text.
Keep the design visually clean and suitable for YouTube.
"""

        image_bytes = await generate_image(

            prompt=combined_prompt,
            headshot_url=headshot_url,
            width=1280,
            height=720
        )

        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)

            if not thumb:
                return

            job_id = thumb.job_id

        url = upload_files(
            files_bytes=image_bytes,
            file_name=f"{thumbnail_id}.png",
            folder=f"thumbnails/{job_id}/"
        )

        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)

            if not thumb:
                return

            thumb.imagekit_url = url
            thumb.status = "uploaded"

            session.add(thumb)
            session.commit()

        logger.info(
            f"Thumbnail {thumbnail_id} generated and uploaded successfully."
        )

    except Exception as e:
        logger.error(
            f"Error generating thumbnail {thumbnail_id}: {str(e)}"
        )

        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)

            if not thumb:
                return

            thumb.status = "failed"
            thumb.error_message = str(e)[:500]

            session.add(thumb)
            session.commit()


async def process_job(job_id: str):
    with Session(engine) as session:
        job = session.get(Job, job_id)

        if not job:
            logger.warning(
                f"Job {job_id} not found in process_job"
            )
            return

        job.status = "processing"

        prompt = job.prompt or ""
        headshot_url = job.headshot_url or ""

        session.add(job)
        session.commit()

        thumbnails = session.exec(
            select(Thumbnail).where(
                Thumbnail.job_id == job_id
            )
        ).all()

        thumbnail_ids = [t.id for t in thumbnails]

    tasks = [
        generate_single_thumbnail(
            thumbnail_id,
            prompt,
            headshot_url
        )
        for thumbnail_id in thumbnail_ids
    ]

    await asyncio.gather(
        *tasks,
        return_exceptions=True
    )

    with Session(engine) as session:
        thumbnails = session.exec(
            select(Thumbnail).where(
                Thumbnail.job_id == job_id
            )
        ).all()

        all_failed = (
            len(thumbnails) > 0
            and all(t.status == "failed" for t in thumbnails)
        )

        job = session.get(Job, job_id)

        if job:
            job.status = "failed" if all_failed else "completed"

            session.add(job)
            session.commit()