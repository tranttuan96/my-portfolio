# VRoid Avatar Guide — free rigged avatar (stylized "you")

Goal: a clean, rigged VRM avatar of Tuan, 100% free. Replaces the failed AI
image-to-3D chibi. VRoid output is polished + properly rigged (unlike Hunyuan3D),
and VRM has built-in lookAt (head/eye tracking) + spring bones (hair) + blendshapes
(blink) — ideal for the "alive, follows your mouse" hero.

Style note: VRoid is stylized/anime-leaning, not photoreal. It'll read as a clean
stylised version of you (dark side-part hair, round glasses, plaid shirt), which is
a coherent professional look — far better than the uncanny AI blob.

## Steps (you do this — your likeness + free desktop app)

1. Download **VRoid Studio** (free, Windows/Mac): https://vroid.com/en/studio
2. New avatar → start from a **male preset**.
3. Customize to resemble you:
   - Face: shape + skin tone to match.
   - Hair: dark, side-parted (use the hair presets, recolor near-black).
   - Outfit: a shirt top; for plaid, pick a checkered preset or apply a
     checkered pattern in the texture editor. Dark pants.
   - Body: adult male proportions (default is fine).
4. **Glasses**: VRoid's built-in accessories are limited. Two options —
   a) add round glasses via a custom item / accessory if available, OR
   b) skip them in VRoid and I'll add simple round-glasses geometry in three.js
      parented to the head bone (reliable). Your call; (b) always works.
5. Export → **VRM**. In the export dialog:
   - VRM **1.0** preferred (fall back to 0.0 if needed — both load fine).
   - Use the reduction options (reduce bones/materials, texture atlas) so the
     file stays web-light (<8MB ideally).
6. Save as `assets-staging/avatar-vroid.vrm` and tell me.

## What I do once I have the VRM

1. Render a 360° turntable of the avatar alone → **you approve the look first**
   (likeness was the past failure point — we lock it before building anything).
2. Load via `@pixiv/three-vrm`. Add animations: retarget free **Mixamo** clips
   (idle / typing / wave) to the VRM humanoid skeleton using the standard
   `loadMixamoAnimation` bone-remap helper.
3. Build the desk scene (reuse the low-poly desk/chair/laptop/mug from git history),
   clean studio lighting.
4. **Head + eyes follow the mouse** via `vrm.lookAt`; hair spring-bones add subtle
   life; periodic blink via blendshape.
5. Lazy-load three.js after first paint; keep the line-art scene as the
   mobile / reduced-motion fallback.

## Cost

VRoid Studio + Mixamo + three.js + @pixiv/three-vrm = all free.
