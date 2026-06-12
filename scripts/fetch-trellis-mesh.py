#!/usr/bin/env python3
"""Generate a TEXTURED 3D mesh (.glb) from one image via the free
microsoft/TRELLIS.2 Hugging Face Space.

Usage:
  ~/.claude/skills/.venv/bin/python3 scripts/fetch-trellis-mesh.py \
      --image input.png --out output.glb [--seed 1234]
"""
import argparse
import shutil
import sys

from gradio_client import Client, handle_file

SPACE = "microsoft/TRELLIS.2"


def glb_path(result):
    """Dig the .glb file path out of a gradio result of unknown shape."""
    stack = [result]
    found = []
    while stack:
        item = stack.pop()
        if isinstance(item, dict):
            stack.extend(item.values())
        elif isinstance(item, (list, tuple)):
            stack.extend(item)
        elif isinstance(item, str) and item.endswith(".glb"):
            found.append(item)
    return found


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--seed", type=int, default=1234)
    parser.add_argument("--texture-size", type=int, default=1024)
    args = parser.parse_args()

    print(f"[1/4] Connecting to {SPACE} ...")
    client = Client(SPACE, verbose=False)
    client.predict(api_name="/start_session")

    print("[2/4] Preprocessing image (background removal)...")
    client.predict(input=handle_file(args.image), api_name="/preprocess_image")

    print("[3/4] Generating 3D (ZeroGPU queue — can take a few minutes)...")
    client.predict(
        image=handle_file(args.image),
        seed=args.seed,
        api_name="/image_to_3d",
    )

    print(f"[4/4] Extracting textured GLB (texture {args.texture_size}px)...")
    result = client.predict(
        decimation_target=100000,
        texture_size=args.texture_size,
        api_name="/extract_glb",
    )

    paths = glb_path(result)
    if not paths:
        print(f"[!] No .glb in result: {result}", file=sys.stderr)
        return 1
    shutil.copy(paths[-1], args.out)
    print(f"Saved: {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
