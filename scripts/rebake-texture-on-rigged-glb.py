#!/usr/bin/env python3
"""Re-unwrap + re-bake the front/back projection texture on an already-rigged
glb whose UVs were damaged by decimation. Keeps armature + all NLA clips.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
      scripts/rebake-texture-on-rigged-glb.py -- \
      <rigged.glb> <front-of-character.png> <back-of-character.png> <out.glb>

Note: pass the image that matches each side of the character — the caller is
responsible for any front/back swap needed by the mesh's axis orientation.
"""
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
SRC, IMG_POS_Y, IMG_NEG_Y, OUT = argv[0], argv[1], argv[2], argv[3]
DECIMATE_RATIO = float(argv[4]) if len(argv) > 4 else 0.0  # 0 = no decimation

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

obj = next(o for o in bpy.context.scene.objects if o.type == "MESH")
armature = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")

# bake must see the undeformed T-pose: rest position + no active action
armature.data.pose_position = "REST"
if armature.animation_data:
    armature.animation_data.action = None
    for track in armature.animation_data.nla_tracks:
        track.mute = True

bpy.ops.object.select_all(action="DESELECT")
obj.select_set(True)
bpy.context.view_layer.objects.active = obj

# ORDER MATTERS: weld restores face connectivity (glTF export split verts at
# UV seams) — decimating BEFORE welding treats the mesh as disconnected
# triangle soup and deletes faces instead of simplifying.
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.remove_doubles(threshold=0.0001)
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode="OBJECT")
print("verts after weld:", len(obj.data.vertices), "faces:", len(obj.data.polygons))

if DECIMATE_RATIO > 0:
    mod = obj.modifiers.new("dec", "DECIMATE")
    mod.ratio = DECIMATE_RATIO
    bpy.ops.object.modifier_apply(modifier="dec")
    print("decimated to:", len(obj.data.polygons), "faces")

bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.003)
bpy.ops.object.mode_set(mode="OBJECT")
bpy.ops.object.shade_smooth()

img_pos = bpy.data.images.load(IMG_POS_Y)  # faces with normal +Y
img_neg = bpy.data.images.load(IMG_NEG_Y)  # faces with normal -Y
bake_img = bpy.data.images.new("baked", 1024, 1024, alpha=False)

mat = bpy.data.materials.new("proj")
mat.use_nodes = True
nt = mat.node_tree
nt.nodes.clear()
n, ln = nt.nodes.new, nt.links.new

geom = n("ShaderNodeNewGeometry")
texco = n("ShaderNodeTexCoord")
sep = n("ShaderNodeSeparateXYZ")
ln(texco.outputs["Generated"], sep.inputs[0])
sepn = n("ShaderNodeSeparateXYZ")
ln(geom.outputs["Normal"], sepn.inputs[0])

inv = n("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
ln(sep.outputs[0], inv.inputs[1])

# glTF meshes keep Y-up LOCAL data (Blender only rotates the object), so the
# character's height axis in Generated coords is Y, not Z
comb_pos = n("ShaderNodeCombineXYZ")
ln(sep.outputs[0], comb_pos.inputs[0])
ln(sep.outputs[1], comb_pos.inputs[1])
comb_neg = n("ShaderNodeCombineXYZ")
ln(inv.outputs[0], comb_neg.inputs[0])
ln(sep.outputs[1], comb_neg.inputs[1])

tex_pos = n("ShaderNodeTexImage"); tex_pos.image = img_pos; tex_pos.extension = "EXTEND"
tex_neg = n("ShaderNodeTexImage"); tex_neg.image = img_neg; tex_neg.extension = "EXTEND"
ln(comb_pos.outputs[0], tex_pos.inputs[0])
ln(comb_neg.outputs[0], tex_neg.inputs[0])

gt = n("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.0
ln(sepn.outputs[1], gt.inputs[0])
mix = n("ShaderNodeMix"); mix.data_type = "RGBA"
ln(gt.outputs[0], mix.inputs["Factor"])
ln(tex_neg.outputs["Color"], mix.inputs[6])
ln(tex_pos.outputs["Color"], mix.inputs[7])

emit = n("ShaderNodeEmission")
ln(mix.outputs[2], emit.inputs["Color"])
out = n("ShaderNodeOutputMaterial")
ln(emit.outputs[0], out.inputs["Surface"])

bake_node = n("ShaderNodeTexImage")
bake_node.image = bake_img
nt.nodes.active = bake_node

obj.data.materials.clear()
obj.data.materials.append(mat)

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 4
scene.cycles.device = "CPU"
bpy.ops.object.bake(type="EMIT")
print("baked color")

# AO pass multiplied into the color map — separates hair/face/clothes visually
ao_img = bpy.data.images.new("ao", 1024, 1024, alpha=False)
bake_node.image = ao_img
scene.cycles.samples = 24
scene.world = bpy.data.worlds.new("w")
bpy.ops.object.bake(type="AO")
print("baked ao")

import numpy as np

color = np.array(bake_img.pixels[:]).reshape(-1, 4)
ao = np.array(ao_img.pixels[:]).reshape(-1, 4)
ao_strength = 0.55 + 0.45 * ao[:, :3]  # soft AO, never fully black
color[:, :3] *= ao_strength
bake_img.pixels = color.ravel().tolist()

final = bpy.data.materials.new("chibi")
final.use_nodes = True
final.use_backface_culling = True  # exports single-sided: kills see-through look
fnt = final.node_tree
bsdf = fnt.nodes["Principled BSDF"]
bsdf.inputs["Roughness"].default_value = 0.92  # matte clay, no plastic shine
if "Specular IOR Level" in bsdf.inputs:
    bsdf.inputs["Specular IOR Level"].default_value = 0.15
timg = fnt.nodes.new("ShaderNodeTexImage")
timg.image = bake_img
fnt.links.new(timg.outputs["Color"], bsdf.inputs["Base Color"])
obj.data.materials.clear()
obj.data.materials.append(final)
bake_img.pack()

# back to posable state so the exporter evaluates clips normally
armature.data.pose_position = "POSE"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=OUT,
    use_selection=True,
    export_animation_mode="ACTIONS",
    export_anim_single_armature=True,
    export_optimize_animation_size=True,
)
print("EXPORTED", OUT)
