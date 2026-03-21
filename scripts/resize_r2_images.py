#!/usr/bin/env python3
"""
Bulk resize & recompress all images in a Cloudflare R2 bucket.

- Downloads each image from R2
- Resizes to max 2000px on the longest side (preserving aspect ratio)
- Recompresses at quality 82 (JPEG) or 85 (WebP/PNG→JPEG conversion)
- Re-uploads in place with the same key
- Skips images already within limits (no unnecessary re-uploads)
- Logs every action so you can see exactly what was changed

Setup:
    pip install boto3 Pillow python-dotenv

Create a .env file next to this script (or export vars) with:
    R2_ACCOUNT_ID=6db8f30b4ca8df6801018f613635c81c
    R2_ACCESS_KEY_ID=your_access_key_id
    R2_SECRET_ACCESS_KEY=your_secret_access_key
    R2_BUCKET_NAME=your_bucket_name

Run:
    python resize_r2_images.py
"""

import io
import os
import sys

import boto3
from botocore.config import Config
from dotenv import load_dotenv
from PIL import Image, ImageOps

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
ACCOUNT_ID        = os.environ["R2_ACCOUNT_ID"]
ACCESS_KEY_ID     = os.environ["R2_ACCESS_KEY_ID"]
SECRET_ACCESS_KEY = os.environ["R2_SECRET_ACCESS_KEY"]
BUCKET_NAME       = os.environ["R2_BUCKET_NAME"]

MAX_DIMENSION = 2400   # px — longest side
JPEG_QUALITY  = 87     # 0-95; higher quality, still ~70-80% smaller than raw
SKIP_BELOW_KB = 150    # skip files already under this size (already small enough)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
# ──────────────────────────────────────────────────────────────────────────────


def make_client():
    endpoint = f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=ACCESS_KEY_ID,
        aws_secret_access_key=SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def list_all_keys(client):
    keys = []
    paginator = client.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=BUCKET_NAME):
        for obj in page.get("Contents", []):
            keys.append((obj["Key"], obj["Size"]))
    return keys


def needs_processing(key, size_bytes):
    ext = os.path.splitext(key)[1].lower()
    if ext not in IMAGE_EXTENSIONS:
        return False
    if size_bytes < SKIP_BELOW_KB * 1024:
        return False
    return True


def process_image(data: bytes, key: str):
    """
    Returns recompressed JPEG bytes, or None if no change was needed.
    """
    try:
        img = Image.open(io.BytesIO(data))
    except Exception as e:
        print(f"  ⚠  Cannot open image: {e}")
        return None

    # Fix EXIF orientation before anything else
    img = ImageOps.exif_transpose(img)

    original_size = img.size
    changed = False

    # Resize if needed
    w, h = img.size
    if max(w, h) > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
        changed = True

    # Convert palette / RGBA → RGB for JPEG output
    if img.mode in ("P", "RGBA", "LA", "L"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode in ("RGBA", "LA"):
            background.paste(img, mask=img.split()[-1])
        else:
            background.paste(img)
        img = background
        changed = True
    elif img.mode != "RGB":
        img = img.convert("RGB")
        changed = True

    # Re-encode as JPEG
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    new_bytes = buf.getvalue()

    if original_size != img.size:
        print(f"  ↓  Resized {original_size} → {img.size}")

    return new_bytes


def run():
    print(f"Connecting to R2 bucket: {BUCKET_NAME}")
    client = make_client()

    print("Listing objects…")
    all_keys = list_all_keys(client)
    candidates = [(k, s) for k, s in all_keys if needs_processing(k, s)]

    print(f"Total objects: {len(all_keys)}")
    print(f"Images to process (>{SKIP_BELOW_KB}KB): {len(candidates)}")
    print()

    saved_bytes = 0
    processed = 0
    skipped = 0
    errors = 0

    for i, (key, size_bytes) in enumerate(candidates, 1):
        print(f"[{i}/{len(candidates)}] {key}  ({size_bytes/1024:.0f} KB)")

        try:
            response = client.get_object(Bucket=BUCKET_NAME, Key=key)
            data = response["Body"].read()
        except Exception as e:
            print(f"  ✗  Download failed: {e}")
            errors += 1
            continue

        new_data = process_image(data, key)

        if new_data is None:
            print(f"  –  No change needed")
            skipped += 1
            continue

        reduction = len(data) - len(new_data)
        pct = reduction / len(data) * 100
        print(f"  ✓  {len(data)/1024:.0f} KB → {len(new_data)/1024:.0f} KB  (-{pct:.0f}%)")

        # Determine new content type (always JPEG after conversion)
        content_type = "image/jpeg"

        try:
            client.put_object(
                Bucket=BUCKET_NAME,
                Key=key,
                Body=new_data,
                ContentType=content_type,
            )
            saved_bytes += reduction
            processed += 1
        except Exception as e:
            print(f"  ✗  Upload failed: {e}")
            errors += 1

    print()
    print("═" * 50)
    print(f"Done.")
    print(f"  Processed : {processed}")
    print(f"  Unchanged : {skipped}")
    print(f"  Errors    : {errors}")
    print(f"  Space saved: {saved_bytes/1024/1024:.1f} MB")


if __name__ == "__main__":
    run()
