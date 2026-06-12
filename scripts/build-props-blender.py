#!/usr/bin/env python3
"""Build the 6 low-poly desk props procedurally and export each as .glb.

Flat-shaded low-poly style matching the site's background shapes.
Real-world scale (meters): desk top at 0.75m, laptop ~0.30m wide.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
      scripts/build-props-blender.py -- public/props
"""
import math
import sys

import bpy

OUT_DIR = sys.argv[sys.argv.index("--") + 1]

# Site-adjacent palette
WOOD = (0.85, 0.62, 0.30, 1)
WOOD_DARK = (0.55, 0.38, 0.20, 1)
DEVICE_GRAY = (0.16, 0.16, 0.19, 1)
DEVICE_LIGHT = (0.55, 0.56, 0.60, 1)
SCREEN_DARK = (0.05, 0.04, 0.10, 1)
MUG_PINK = (1.0, 0.36, 0.56, 1)
COFFEE = (0.24, 0.14, 0.08, 1)
SEAT_GREEN = (0.24, 0.86, 0.59, 1)


def mat(name, rgba):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = 0.6
    return m


def box(name, size, loc, material, bevel=0.005):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    # cube size=1 has edge length 1 — scale by full size to get target dimensions
    o.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = o.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier="bevel")
    o.data.materials.append(material)
    return o


def cylinder(name, r, depth, loc, material, verts=16, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(material)
    return o


def export(objs, filename):
    """Merge parts into ONE mesh via bmesh (bakes world transforms + material
    indices manually — bpy.ops.object.join is unreliable in background mode)."""
    import bmesh

    materials = []
    bm = bmesh.new()
    for o in objs:
        material = o.data.materials[0] if o.data.materials else None
        if material not in materials:
            materials.append(material)
        midx = materials.index(material)
        tmp = o.data.copy()
        tmp.transform(o.matrix_world)
        for poly in tmp.polygons:
            poly.material_index = midx
            poly.use_smooth = False
        bm.from_mesh(tmp)
        bpy.data.meshes.remove(tmp)

    merged = bpy.data.meshes.new(filename)
    bm.to_mesh(merged)
    bm.free()
    for material in materials:
        merged.materials.append(material)

    for o in objs:
        bpy.data.objects.remove(o, do_unlink=True)

    final = bpy.data.objects.new(filename, merged)
    bpy.context.scene.collection.objects.link(final)
    bpy.ops.object.select_all(action="DESELECT")
    final.select_set(True)
    bpy.ops.export_scene.gltf(filepath=f"{OUT_DIR}/{filename}", use_selection=True)
    bpy.data.objects.remove(final, do_unlink=True)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


# ---- desk: top + 4 legs, top surface at z=0.75
reset()
wood, wood_d = mat("wood", WOOD), mat("wood_dark", WOOD_DARK)
parts = [box("top", (1.4, 0.7, 0.05), (0, 0, 0.725), wood, 0.01)]
for sx in (-0.62, 0.62):
    for sy in (-0.28, 0.28):
        parts.append(box("leg", (0.07, 0.07, 0.70), (sx, sy, 0.35), wood_d))
export(parts, "desk.glb")

# ---- chair: seat 0.45m, backrest, 4 legs
reset()
seat_m, leg_m = mat("seat", SEAT_GREEN), mat("legc", DEVICE_GRAY)
parts = [
    box("seat", (0.42, 0.42, 0.06), (0, 0, 0.45), seat_m, 0.015),
    box("back", (0.42, 0.05, 0.45), (0, 0.185, 0.72), seat_m, 0.015),
]
for sx in (-0.17, 0.17):
    for sy in (-0.17, 0.17):
        parts.append(box("legc", (0.05, 0.05, 0.42), (sx, sy, 0.21), leg_m))
export(parts, "chair.glb")

# ---- laptop: base + tilted lid w/ dark screen inset
reset()
body_m, screen_m = mat("device", DEVICE_GRAY), mat("screen", SCREEN_DARK)
base = box("base", (0.30, 0.21, 0.012), (0, 0, 0.006), body_m, 0.003)
lid = box("lid", (0.30, 0.012, 0.20), (0, -0.10, 0.10), body_m, 0.003)
lid.rotation_euler = (math.radians(-12), 0, 0)
scr = box("scr", (0.27, 0.004, 0.17), (0, -0.105, 0.10), screen_m, 0.0)
scr.rotation_euler = (math.radians(-12), 0, 0)
export([base, lid, scr], "laptop.glb")

# ---- keyboard: slab + simplified key rows
reset()
kb_m, key_m = mat("device", DEVICE_GRAY), mat("keys", DEVICE_LIGHT)
parts = [box("kb", (0.35, 0.13, 0.015), (0, 0, 0.0075), kb_m, 0.004)]
for row in range(4):
    parts.append(box("krow", (0.31, 0.024, 0.006), (0, -0.042 + row * 0.028, 0.017), key_m, 0.002))
export(parts, "keyboard.glb")

# ---- mouse: squashed rounded box
reset()
mouse_m = mat("keys", DEVICE_LIGHT)
m = box("mouse", (0.06, 0.10, 0.035), (0, 0, 0.0175), mouse_m, 0.012)
export([m], "mouse.glb")

# ---- mug: cylinder + handle + coffee surface
reset()
mug_m, cof_m = mat("mug", MUG_PINK), mat("coffee", COFFEE)
body = cylinder("mug", 0.045, 0.10, (0, 0, 0.05), mug_m)
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.032, minor_radius=0.008, location=(0.052, 0, 0.05),
    rotation=(0, math.radians(90), 0), major_segments=12, minor_segments=8,
)
handle = bpy.context.active_object
handle.data.materials.append(mug_m)
coffee = cylinder("coffee", 0.038, 0.004, (0, 0, 0.098), cof_m)
export([body, handle, coffee], "mug.glb")

print("ALL PROPS EXPORTED")
