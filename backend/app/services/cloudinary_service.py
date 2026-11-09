import base64
import hashlib
import logging
import os
import time
from typing import Dict, Any, Tuple
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def is_cloudinary_configured() -> bool:
    return bool(
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    )


async def upload_avatar_image(
    image_base64: str,
    filename: str = "avatar.png",
    user_id: int = 0,
) -> Dict[str, Any]:
    """Uploads an avatar image.
    If Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
    are present in settings, uploads to Cloudinary via REST API.
    Otherwise, provides a reliable local/data fallback so the app works seamlessly
    before keys are configured.
    """
    if is_cloudinary_configured():
        try:
            timestamp = int(time.time())
            folder = "ayushya_avatars"
            # Cloudinary signature requires parameters to be sorted alphabetically
            to_sign = f"folder={folder}&timestamp={timestamp}{settings.cloudinary_api_secret}"
            signature = hashlib.sha1(to_sign.encode("utf-8")).hexdigest()

            upload_url = f"https://api.cloudinary.com/v1_1/{settings.cloudinary_cloud_name}/image/upload"

            async with httpx.AsyncClient(timeout=30.0) as client:
                data = {
                    "file": image_base64,
                    "api_key": settings.cloudinary_api_key,
                    "timestamp": str(timestamp),
                    "signature": signature,
                    "folder": folder,
                }
                response = await client.post(upload_url, data=data)
                if response.status_code == 200:
                    res_json = response.json()
                    secure_url = res_json.get("secure_url") or res_json.get("url")
                    logger.info("Successfully uploaded avatar to Cloudinary: %s", secure_url)
                    return {
                        "url": secure_url,
                        "provider": "cloudinary",
                        "public_id": res_json.get("public_id"),
                        "message": "Uploaded to Cloudinary successfully",
                    }
                else:
                    logger.warning(
                        "Cloudinary upload returned %d: %s. Falling back to local data.",
                        response.status_code,
                        response.text,
                    )
        except Exception as e:
            logger.error("Cloudinary upload failed with error: %s. Using fallback.", e)

    # ── Fallback (Local file in public/uploads or Base64 Data URI) ──
    try:
        if "," in image_base64:
            header, encoded = image_base64.split(",", 1)
            file_bytes = base64.b64decode(encoded)
        else:
            file_bytes = base64.b64decode(image_base64)

        public_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "uploads")
        )
        os.makedirs(public_dir, exist_ok=True)
        save_name = f"avatar_user_{user_id}_{int(time.time())}.png"
        save_path = os.path.join(public_dir, save_name)
        with open(save_path, "wb") as f:
            f.write(file_bytes)
        local_url = f"/uploads/{save_name}"
        return {
            "url": local_url,
            "provider": "local_storage",
            "message": "Saved to local storage (Cloudinary credentials not configured).",
        }
    except Exception:
        # If filesystem write is not possible, return raw image data URI directly
        return {
            "url": image_base64,
            "provider": "data_uri",
            "message": "Saved as Data URI (Cloudinary credentials not configured).",
        }

