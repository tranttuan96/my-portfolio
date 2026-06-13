#!/usr/bin/env python3
"""Texture an untextured mesh by projecting front/back reference images onto
it (normal-direction mask), baked into a real UV texture. No GPU service
needed — pure local Blender/Cycles.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
      scripts/project-texture-from-views.py -- \
      <shape.glb> <front.png> <back.png> <out.glb> [front_axis=Y] [tris=60000]
"""
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
SRC, FRONT_IMG, BACK_IMG, OUT = argv[0], argv[1], argv[2], argv[3]
FRONT_AXIS = argv[4] if len(argv) > 4 else "Y"  # which +axis the face looks toward
TARGET_TRIS = int(argv[5]) if len(argv) > 5 else 60000

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
obj = meshes[0]
# clear hierarchy: keep world transform, drop gltf wrapper empties from selection
bpy.ops.object.select_all(action="DESELECT")
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# 1) decimate for web + Mixamo friendliness
tri_count = len(obj.data.polygons)
if tri_count > TARGET_TRIS:
    mod = obj.modifiers.new("dec", "DECIMATE")
    mod.ratio = TARGET_TRIS / tri_count
    bpy.ops.object.modifier_apply(modifier="dec")
    print(f"decimated {tri_count} -> {len(obj.data.polygons)} tris")

# 2) smart UV unwrap
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.003)
bpy.ops.object.mode_set(mode="OBJECT")

# 3) projection material: mix front/back images by face direction
front_img = bpy.data.images.load(FRONT_IMG)
back_img = bpy.data.images.load(BACK_IMG)
bake_img = bpy.data.images.new("baked", 1024, 1024, alpha=False)

mat = bpy.data.materials.new("proj")
mat.use_nodes = True
nt = mat.node_tree
nt.nodes.clear()
n = nt.nodes.new
ln = nt.links.new

geom = n("ShaderNodeNewGeometry")
texco = n("ShaderNodeTexCoord")  # Generated = bbox-normalized 0..1

axis_idx = {"X": 0, "Y": 1, "Z": 2}[FRONT_AXIS]
sep = n("ShaderNodeSeparateXYZ")
ln(texco.outputs["Generated"], sep.inputs[0])
sepn = n("ShaderNodeSeparateXYZ")
ln(geom.outputs["Normal"], sepn.inputs[0])

# u for front: bbox X (mirrored or not depends on axis handedness) — start
# with x as-is for front, 1-x for back; v: bbox Z (height)
inv = n("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
ln(sep.outputs[0], inv.inputs[1])

comb_f = n("ShaderNodeCombineXYZ")
ln(sep.outputs[0], comb_f.inputs[0])
ln(sep.outputs[2], comb_f.inputs[1])
comb_b = n("ShaderNodeCombineXYZ")
ln(inv.outputs[0], comb_b.inputs[0])
ln(sep.outputs[2], comb_b.inputs[1])

tex_f = n("ShaderNodeTexImage"); tex_f.image = front_img; tex_f.extension = "EXTEND"
tex_b = n("ShaderNodeTexImage"); tex_b.image = back_img; tex_b.extension = "EXTEND"
ln(comb_f.outputs[0], tex_f.inputs[0])
ln(comb_b.outputs[0], tex_b.inputs[0])

# mask: facing front axis → front image
gt = n("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.0
ln(sepn.outputs[axis_idx], gt.inputs[0])
mix = n("ShaderNodeMix"); mix.data_type = "RGBA"
ln(gt.outputs[0], mix.inputs["Factor"])
ln(tex_b.outputs["Color"], mix.inputs[6])
ln(tex_f.outputs["Color"], mix.inputs[7])

emit = n("ShaderNodeEmission")
ln(mix.outputs[2], emit.inputs["Color"])
out = n("ShaderNodeOutputMaterial")
ln(emit.outputs[0], out.inputs["Surface"])

# bake target node (active)
bake_node = n("ShaderNodeTexImage")
bake_node.image = bake_img
nt.nodes.active = bake_node

obj.data.materials.clear()
obj.data.materials.append(mat)

# 4) bake emission -> texture
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 4
scene.cycles.device = "CPU"
bpy.ops.object.bake(type="EMIT")
print("baked color")

# AO multiplied into color — separates hair/face/clothes into readable parts
ao_img = bpy.data.images.new("ao", 1024, 1024, alpha=False)
bake_node.image = ao_img
scene.cycles.samples = 24
scene.world = bpy.data.worlds.new("w")
bpy.ops.object.bake(type="AO")
print("baked ao")

import numpy as np

color = np.array(bake_img.pixels[:]).reshape(-1, 4)
ao = np.array(ao_img.pixels[:]).reshape(-1, 4)
color[:, :3] *= 0.55 + 0.45 * ao[:, :3]
bake_img.pixels = color.ravel().tolist()

# 5) final material: matte clay, single-sided (double-sided reads translucent)
final = bpy.data.materials.new("chibi")
final.use_nodes = True
final.use_backface_culling = True
fnt = final.node_tree
bsdf = fnt.nodes["Principled BSDF"]
bsdf.inputs["Roughness"].default_value = 0.92
if "Specular IOR Level" in bsdf.inputs:
    bsdf.inputs["Specular IOR Level"].default_value = 0.15
timg = fnt.nodes.new("ShaderNodeTexImage")
timg.image = bake_img
fnt.links.new(timg.outputs["Color"], bsdf.inputs["Base Color"])
obj.data.materials.clear()
obj.data.materials.append(final)

bake_img.pack()
bpy.ops.object.select_all(action="DESELECT")
obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True)
print("EXPORTED", OUT)
