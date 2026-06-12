#!/usr/bin/env python3
"""Merge the Mixamo rigged base + animation FBXs into one .glb whose
AnimationClips are named for the web app (Fly/Land/Wave/Sit/SitToType/Type).

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
      scripts/merge-mixamo-clips-to-glb.py -- assets-staging/mixamo assets-staging/avatar-merged.glb
"""
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
MIXAMO_DIR, OUT = argv[0], argv[1]

CLIPS = [
    ("anim-fly.fbx", "Fly"),
    ("anim-land.fbx", "Land"),
    ("anim-wave.fbx", "Wave"),
    ("anim-sit.fbx", "Sit"),
    ("anim-sit-to-type.fbx", "SitToType"),
    ("anim-type.fbx", "Type"),
]

bpy.ops.wm.read_factory_settings(use_empty=True)

# 1) base character (mesh + armature + skin + texture)
bpy.ops.import_scene.fbx(filepath=os.path.join(MIXAMO_DIR, "rigged-base.fbx"))
base_armature = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
base_objects = set(bpy.context.scene.objects)
print("base armature:", base_armature.name)

base_armature.animation_data_create()

# 2) import each animation fbx, steal its action, bin the rest
actions = []
for fname, clip_name in CLIPS:
    path = os.path.join(MIXAMO_DIR, fname)
    if not os.path.exists(path):
        print("SKIP missing", fname)
        continue
    before = set(bpy.context.scene.objects)
    before_actions = set(bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=path)
    new_actions = [a for a in bpy.data.actions if a not in before_actions]
    if not new_actions:
        print("WARN no action in", fname)
        continue
    action = new_actions[0]
    action.name = clip_name
    action.use_fake_user = True
    actions.append(action)
    for obj in set(bpy.context.scene.objects) - before:
        bpy.data.objects.remove(obj, do_unlink=True)
    print("imported clip:", clip_name)

# 3) stash every action as an NLA track on the base armature so the glTF
#    exporter (ACTIONS mode) emits one AnimationClip per action
for action in actions:
    track = base_armature.animation_data.nla_tracks.new()
    track.name = action.name
    strip = track.strips.new(action.name, 1, action)
    strip.name = action.name
    track.mute = True
base_armature.animation_data.action = None

# 4) pack textures + export
for img in bpy.data.images:
    if img.source == "FILE" and not img.packed_file:
        try:
            img.pack()
        except RuntimeError:
            pass

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=OUT,
    use_selection=True,
    export_animation_mode="ACTIONS",
    export_anim_single_armature=True,
    export_optimize_animation_size=True,
)
print("EXPORTED", OUT, "clips:", [a.name for a in actions])
