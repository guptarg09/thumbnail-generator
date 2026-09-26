import asyncio
from io import BytesIO

import httpx
from huggingface_hub import InferenceClient

from config import HF_TOKEN


from urllib.parse import urlparse
import ipaddress
from PIL import Image, ImageOps

def get_client() -> InferenceClient:
    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN is missing from the environment. Please configure HF_TOKEN in your .env file.")
    return InferenceClient(
        provider="auto",
        api_key=HF_TOKEN,
    )


async def download_image(image_url: str) -> bytes:
    url = (image_url or "").strip()
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(
            f"Invalid headshot URL: '{image_url}'. URL must begin with 'http://' or 'https://'."
        )
    
    # SSRF protection: block link-local and cloud metadata addresses
    hostname = parsed.hostname or ""
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_loopback or ip.is_link_local or ip.is_reserved or str(ip).startswith("169.254."):
            raise ValueError(f"Access to private/metadata IP address {hostname} is forbidden.")
    except ValueError as val_err:
        if "forbidden" in str(val_err):
            raise
        # Not an IP literal, it is a domain name (e.g. ik.imagekit.io)

    async with httpx.AsyncClient(timeout=30.0) as http_client:
        response = await http_client.get(url)
        response.raise_for_status()
        return response.content


def generate_with_huggingface(
    prompt: str,
    style_prompt: str,
    headshot_bytes: bytes,
) -> bytes:

    full_prompt = f"""
Create a professional YouTube thumbnail.

Main topic:
{prompt}

Visual style:
{style_prompt}

Use the provided person as the main subject.

IMPORTANT:
- Preserve the person's recognizable facial appearance.
- Make the person visually prominent.
- Create a high-impact YouTube thumbnail.
- Use strong lighting and contrast.
- Use a clean professional composition.
- Create an eye-catching background related to the topic.
- Leave appropriate space for thumbnail text.
- Avoid a generic stock-photo appearance.
"""

    client = get_client()
    result = client.image_to_image(
        image=headshot_bytes,
        prompt=full_prompt,
        model="black-forest-labs/FLUX.1-Kontext-dev",
    )

    if result is None:
        raise RuntimeError("Hugging Face did not return an image.")

    # Ensure native 16:9 YouTube thumbnail dimensions (1280x720) without facial distortion
    if result.size != (1280, 720):
        result = ImageOps.fit(result, (1280, 720), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))

    output = BytesIO()
    result.save(output, format="PNG")

    return output.getvalue()


async def generate_thumbnail(
    prompt: str,
    style_prompt: str,
    headshot_url: str,
) -> bytes:

    headshot_bytes = await download_image(headshot_url)

    image_bytes = await asyncio.to_thread(
        generate_with_huggingface,
        prompt,
        style_prompt,
        headshot_bytes,
    )

    return image_bytes