#!/usr/bin/env python3
"""Convert a .glb to .fbx for Mixamo upload, via headless Blender.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
      scripts/convert-glb-to-fbx.py -- input.glb output.fbx

Mixamo wants: a single mesh-ish humanoid, Y-up, reasonable size (~1.7m tall
works well for its auto-rigger). This script imports the glb, normalizes
height to 1.7m, applies transforms, and exports FBX with mesh only.
"""
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
src, dst = argv[0], argv[1]

# Clean default scene
bpy.ops.wm.read_factory_settings(use_empty=True)

bpy.ops.import_scene.gltf(filepath=src)

# Normalize: join meshes, scale tallest dimension to 1.7m, drop to ground
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
if not meshes:
    print("No mesh found in", src)
    sys.exit(1)

bpy.ops.object.select_all(action="DESELECT")
for obj in meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
model = bpy.context.view_layer.objects.active

bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
dims = model.dimensions
height = max(dims.x, dims.y, dims.z)
model.scale = (1.7 / height,) * 3
bpy.ops.object.transform_apply(scale=True)

# Drop so feet sit at z=0 (Blender Z-up; exporter converts to Y-up for FBX)
from mathutils import Vector

min_z = min((model.matrix_world @ Vector(c)).z for c in model.bound_box)
model.location.z -= min_z
bpy.ops.object.transform_apply(location=True)

bpy.ops.export_scene.fbx(
    filepath=dst,
    use_selection=True,
    object_types={"MESH"},
    path_mode="COPY",
    embed_textures=True,
    apply_scale_options="FBX_SCALE_ALL",
)
print("Exported:", dst)
