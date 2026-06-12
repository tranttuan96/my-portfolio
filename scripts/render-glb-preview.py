#!/usr/bin/env python3
"""Render front/side/back preview PNGs of a .glb via headless Blender.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
      scripts/render-glb-preview.py -- input.glb output-prefix
"""
import math
import sys

import bpy
import mathutils

argv = sys.argv[sys.argv.index("--") + 1 :]
src, outprefix = argv[0], argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
mins = [min((o.matrix_world @ mathutils.Vector(c))[i] for o in meshes for c in o.bound_box) for i in range(3)]
maxs = [max((o.matrix_world @ mathutils.Vector(c))[i] for o in meshes for c in o.bound_box) for i in range(3)]
center = mathutils.Vector([(mins[i] + maxs[i]) / 2 for i in range(3)])
size = max(maxs[i] - mins[i] for i in range(3))

scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "TEXTURE"
scene.render.resolution_x = 512
scene.render.resolution_y = 512

cam_data = bpy.data.cameras.new("cam")
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

for name, ang in [("front", 0), ("side", 90), ("back", 180)]:
    rad = math.radians(ang)
    cam.location = center + mathutils.Vector(
        (math.sin(rad) * size * 2.2, -math.cos(rad) * size * 2.2, size * 0.3)
    )
    direction = center - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = f"{outprefix}-{name}.png"
    bpy.ops.render.render(write_still=True)

print("RENDERED")
