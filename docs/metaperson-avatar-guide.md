# MetaPerson Avatar Guide — realistic rigged avatar from a selfie

Goal: a clean, professionally-rigged GLB of Tuan (replaces the failed AI image-to-3D
chibi). This is the Ready Player Me successor that the good three.js portfolios use.

## Why this (not Hunyuan3D)

AI image-to-3D (Hunyuan3D/TRELLIS) = blobby mesh, bad topology, smeared texture →
that's why the last two avatars looked bad. MetaPerson / RPM-style tools output a
**clean rigged humanoid** (proper face, body, skeleton, blendshapes) ready for
Mixamo animations + three.js. Ready Player Me shut its public service on
2026-01-31 (Netflix), so MetaPerson is the current go-to.

## Steps (you do this — it's your face + account)

1. Open https://metaperson.avatarsdk.com/  → sign up (free account).
2. **Upload a clear front selfie**: good even lighting, face straight to camera,
   neutral or slight smile, hair off the face, glasses on (so the avatar keeps them).
3. Let it generate, then **customize** to match you: hairstyle (dark, side-part),
   glasses (round), outfit (plaid/checkered shirt + dark pants if available), skin tone.
4. Pick **FULL-BODY** (not half-body) — needed so seated/typing animations work.
5. **Export → format GLB → download.**
6. Save the file as `assets-staging/avatar-metaperson.glb` and tell me.

## If GLB download is locked behind payment

The standalone creator is "free to start" but the GLB **download** may require a
paid/dev plan. Options:
- **VTubeMe** (https://vtubeme.com) — MetaPerson-powered, selfie → avatar, exports
  **GLB + VRM** for a **one-time $7.99**. Reliable consumer path.
- Tell me if it's blocked and you don't want to pay — I'll help find a free
  RPM-compatible alternative (in3D / Union Avatars free tiers).

## What I do once I have the GLB

1. Inspect its skeleton (MetaPerson uses an RPM-style humanoid rig).
2. Add animations — MetaPerson/RPM-compatible idle + typing + wave, or retarget
   Mixamo clips to its bones.
3. Build the desk scene (reuse the low-poly desk/chair/laptop/mug props from git
   history) with the avatar seated, clean studio lighting.
4. **Head + eyes follow the mouse cursor** (the signature "alive" effect).
5. Lazy-load three.js after first paint; keep the line-art scene as the
   mobile / reduced-motion fallback.

## Review gate

Likeness quality was the past failure point — so we review the **avatar GLB by
itself** (a turntable render) and confirm it looks good BEFORE building the scene
around it. No more building blind.
