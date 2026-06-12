#!/usr/bin/env python3
"""Generate a textured 3D mesh (.glb) from image(s) via the free
tencent/Hunyuan3D-2 Hugging Face Space.

Usage:
  python3 fetch-hunyuan3d-mesh.py --image path/to/front.png --out out.glb
  python3 fetch-hunyuan3d-mesh.py --front f.png --back b.png --left l.png --out out.glb

Run with the venv that has gradio_client:
  ~/.claude/skills/.venv/bin/python3 scripts/fetch-hunyuan3d-mesh.py ...
"""
import argparse
import shutil
import sys

from gradio_client import Client, handle_file

SPACE = "tencent/Hunyuan3D-2"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", help="single reference image")
    parser.add_argument("--front", help="multi-view: front image")
    parser.add_argument("--back", help="multi-view: back image")
    parser.add_argument("--left", help="multi-view: left image")
    parser.add_argument("--right", help="multi-view: right image")
    parser.add_argument("--steps", type=int, default=30)
    parser.add_argument("--seed", type=int, default=1234)
    parser.add_argument("--out", required=True, help="output .glb path")
    args = parser.parse_args()

    if not args.image and not args.front:
        parser.error("provide --image or --front (+ optional --back/--left/--right)")

    print(f"[1/3] Connecting to {SPACE} ...")
    client = Client(SPACE, verbose=False)

    kwargs = dict(
        caption=None,
        image=handle_file(args.image) if args.image else None,
        mv_image_front=handle_file(args.front) if args.front else None,
        mv_image_back=handle_file(args.back) if args.back else None,
        mv_image_left=handle_file(args.left) if args.left else None,
        mv_image_right=handle_file(args.right) if args.right else None,
        steps=args.steps,
        guidance_scale=5.0,
        seed=args.seed,
        octree_resolution=256,
        check_box_rembg=True,
        num_chunks=8000,
        randomize_seed=False,
    )

    print("[2/3] Generating shape + texture (queue on free ZeroGPU, can take minutes)...")
    result = client.predict(api_name="/generation_all", **kwargs)

    # Result tuple: (file_3d, file_3d_textured, html, stats, seed) — shapes vary by Space
    # version, so scan for the textured glb path.
    paths = []
    for item in result if isinstance(result, (list, tuple)) else [result]:
        if isinstance(item, dict) and "value" in item:
            item = item["value"]
        if isinstance(item, str) and item.endswith(".glb"):
            paths.append(item)
    if not paths:
        print(f"[!] No .glb in result: {result}", file=sys.stderr)
        return 1

    # Prefer the last glb (textured); first is usually the white-model shape.
    src = paths[-1]
    shutil.copy(src, args.out)
    print(f"[3/3] Saved: {args.out} (from {src})")
    if len(paths) > 1:
        shutil.copy(paths[0], args.out.replace(".glb", "-shape-only.glb"))
        print(f"      Also saved shape-only variant: {args.out.replace('.glb', '-shape-only.glb')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
