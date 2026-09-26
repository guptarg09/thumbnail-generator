import base64
import io
import logging

import httpx
from PIL import Image

from config import (
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_AI_MODEL,
)

logger = logging.getLogger(__name__)


def _get_endpoint() -> str:
    if not CLOUDFLARE_ACCOUNT_ID:
        raise RuntimeError(
            "CLOUDFLARE_ACCOUNT_ID is missing from backend/.env"
        )

    if not CLOUDFLARE_API_TOKEN:
        raise RuntimeError(
            "CLOUDFLARE_API_TOKEN is missing from backend/.env"
        )

    return (
        f"https://api.cloudflare.com/client/v4/accounts/"
        f"{CLOUDFLARE_ACCOUNT_ID}/ai/run/{CLOUDFLARE_AI_MODEL}"
    )


def _prepare_reference_image(image_bytes: bytes) -> bytes:
    """
    Resize the user's headshot so it is smaller than 512x512,
    as required by FLUX.2 Klein reference images.
    """

    image = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB for JPEG compatibility
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Keep aspect ratio and make sure both dimensions are below 512
    image.thumbnail((480, 480))

    output = io.BytesIO()

    image.save(
        output,
        format="JPEG",
        quality=90
    )

    return output.getvalue()


async def generate_image(
    prompt: str,
    headshot_url: str = "",
    width: int = 1280,
    height: int = 720,
) -> bytes:

    endpoint = _get_endpoint()

    # Download the uploaded headshot from ImageKit
    headshot_bytes = None

    if headshot_url:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(headshot_url)

            if response.status_code == 200:
                headshot_bytes = _prepare_reference_image(
                    response.content
                )

                logger.info(
                    "Headshot downloaded and prepared for Cloudflare AI."
                )

            else:
                logger.warning(
                    "Could not download headshot. HTTP %s",
                    response.status_code
                )

        except httpx.RequestError as exc:
            logger.warning(
                "Could not download headshot: %s",
                exc
            )

    # Tell the model exactly how to use the reference image
    final_prompt = f"""
Create a professional YouTube thumbnail.

The person in the reference image is the main subject.

IMPORTANT:
- Preserve the identity and facial appearance of the person in the reference image.
- Keep the person's face recognizable.
- Do not replace the person with another person.
- Do not invent a different face.
- Use the reference person as the primary subject.
- Create a professional YouTube thumbnail composition.
- Leave appropriate visual space for the title.
- Do not generate long paragraphs of text.
- Do not generate a fake watermark.

{prompt}
"""

    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
    }

    data = {
        "prompt": final_prompt,
        "width": str(width),
        "height": str(height),
    }

    files = None

    if headshot_bytes:
        files = {
            "input_image_0": (
                "headshot.jpg",
                headshot_bytes,
                "image/jpeg",
            )
        }

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:

            response = await client.post(
                endpoint,
                headers=headers,
                data=data,
                files=files,
            )

        if response.status_code != 200:
            logger.error(
                "Cloudflare AI request failed: %s - %s",
                response.status_code,
                response.text,
            )

            raise RuntimeError(
                f"Cloudflare AI request failed "
                f"(HTTP {response.status_code})"
            )

        result = response.json()

        if not result.get("success"):
            logger.error(
                "Cloudflare AI returned unsuccessful response: %s",
                result,
            )

            raise RuntimeError(
                "Cloudflare AI generation failed"
            )

        image_base64 = (
            result
            .get("result", {})
            .get("image")
        )

        if not image_base64:
            raise RuntimeError(
                "Cloudflare AI response did not contain an image"
            )

        return base64.b64decode(image_base64)

    except httpx.TimeoutException:
        raise RuntimeError(
            "Cloudflare AI request timed out"
        )

    except httpx.RequestError as exc:
        logger.error(
            "Cloudflare AI network error: %s",
            exc
        )

        raise RuntimeError(
            "Could not connect to Cloudflare Workers AI"
        )