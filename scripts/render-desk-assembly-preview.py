#!/usr/bin/env python3
"""Assemble all props into a desk setup and render one preview PNG.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
      scripts/render-desk-assembly-preview.py -- public/props assets-staging/desk-preview.png
"""
import math
import sys

import bpy
import mathutils

argv = sys.argv[sys.argv.index("--") + 1 :]
props_dir, out_png = argv[0], argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)

# (file, location, z-rotation deg) — laptop/keyboard/mouse/mug on desk top (z=0.75)
layout = [
    ("desk.glb", (0, 0, 0), 0),
    ("chair.glb", (0, -0.55, 0), 0),
    ("laptop.glb", (0, 0.12, 0.75), 0),
    ("keyboard.glb", (0, -0.13, 0.75), 0),
    ("mouse.glb", (0.26, -0.13, 0.75), 0),
    ("mug.glb", (-0.45, 0.05, 0.75), 0),
]
for fname, loc, rz in layout:
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=f"{props_dir}/{fname}")
    for obj in set(bpy.context.scene.objects) - before:
        obj.location = mathutils.Vector(obj.location) + mathutils.Vector(loc)
        obj.rotation_euler.z += math.radians(rz)

scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "MATERIAL"
scene.render.resolution_x = 800
scene.render.resolution_y = 600

cam_data = bpy.data.cameras.new("cam")
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam.location = (1.8, -2.2, 1.5)
target = mathutils.Vector((0, 0, 0.5))
cam.rotation_euler = (target - mathutils.Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()

scene.render.filepath = out_png
bpy.ops.render.render(write_still=True)
print("RENDERED", out_png)
