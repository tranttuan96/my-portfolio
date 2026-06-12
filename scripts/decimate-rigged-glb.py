#!/usr/bin/env python3
"""Decimate the skinned mesh inside a rigged .glb (weights + NLA clips kept).

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
      scripts/decimate-rigged-glb.py -- in.glb out.glb 0.45
"""
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
SRC, OUT, RATIO = argv[0], argv[1], float(argv[2])

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

mesh_obj = next(o for o in bpy.context.scene.objects if o.type == "MESH")
bpy.ops.object.select_all(action="DESELECT")
mesh_obj.select_set(True)
bpy.context.view_layer.objects.active = mesh_obj

before = len(mesh_obj.data.polygons)
mod = mesh_obj.modifiers.new("dec", "DECIMATE")
mod.ratio = RATIO
bpy.ops.object.modifier_apply(modifier="dec")
print(f"decimated {before} -> {len(mesh_obj.data.polygons)} tris")

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
print("EXPORTED", OUT)
