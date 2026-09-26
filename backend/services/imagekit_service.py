import os
from imagekitio import ImageKit

from config import IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT 
# using imagekit for storing and serving images for fast performance

# imagekit initial
imagekit = ImageKit(
    private_key=IMAGEKIT_PRIVATE_KEY
)

def upload_file(files_bytes: bytes, file_name: str, folder: str, content_type: str = "image/png") -> str:
    """Upload a file to ImageKit and return the CDN URL"""

    result = imagekit.files.upload(
        file=(file_name, files_bytes, content_type),
        file_name=file_name,
        folder=folder,
        is_private_file=False, 
        use_unique_file_name=True
    )
    return result.url

upload_files = upload_file

# this is used to get 3 variant URLs from imagekit server
def get_variants(base_url: str):
    """Generate size variant URLs using ImageKit transformations"""
    return {
        "small": base_url + "?tr=w-1280,h-720,c-maintain-ratio,fo-auto",
        "medium": base_url + "?tr=w-1080,h-1920,c-maintain-ratio,fo-auto",
        "large": base_url + "?tr=w-1080,h-1080,c-maintain-ratio,fo-auto",
        "youtube": base_url + "?tr=w-1280,h-720,c-maintain-ratio,fo-auto",
        "shorts": base_url + "?tr=w-1080,h-1920,c-maintain-ratio,fo-auto",
        "square": base_url + "?tr=w-1080,h-1080,c-maintain-ratio,fo-auto"
    }

get_varients = get_variants




    
    