"""Add cloud islands, assembly groups, and a brass/ivory rocket to Kevin's rooms.
Run Blender with --background <room-source.blend> --python this-script -- <output-dir>.
The input is retained; editable output and independent GLBs are written to output-dir.
"""
import bpy
import bmesh
import math
import random
import sys
from pathlib import Path
from mathutils import Vector

out = Path(sys.argv[sys.argv.index('--') + 1]).resolve()
out.mkdir(parents=True, exist_ok=True)

def empty(name, parent=None, stage=None):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    if stage is not None: obj['reveal_order'] = stage
    return obj

def mat(name, rgb, metal=0, rough=.65, emission=0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = (*rgb, 1)
    shader = material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*rgb, 1)
    shader.inputs['Metallic'].default_value = metal
    shader.inputs['Roughness'].default_value = rough
    shader.inputs['Emission Color'].default_value = (*rgb, 1)
    shader.inputs['Emission Strength'].default_value = emission
    return material

cloud_material = mat('Pearl smoke cloud', (.32,.31,.285), rough=.95)
brass = bpy.data.materials.get('Warm brass')
ivory = bpy.data.materials.get('Ivory')
obsidian = bpy.data.materials.get('Obsidian')
glass = mat('Rocket smoked glass', (.015,.025,.035), metal=.6, rough=.16)
fire = mat('Rocket warm exhaust', (1,.42,.07), rough=.45, emission=2)

def sphere(name, loc, scale, material, parent):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, radius=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    obj.parent = parent
    for poly in obj.data.polygons: poly.use_smooth = True
    return obj

def cloud(room):
    group = empty('assembly_cloud_' + room.name, room, 0)
    rng = random.Random(38)
    parts = [sphere('Cloud core', (0,0,-.55), (2.02,1.69,.42), cloud_material, group)]
    for i in range(14):
        angle = i * math.tau / 14
        r = rng.uniform(.45,.66)
        parts.append(sphere('Cloud billow', (math.cos(angle)*1.77,math.sin(angle)*1.42,-.44+rng.uniform(-.12,.04)),
            (r,r*.95,r*.70), cloud_material, group))
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts: obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    # Fuse billows into one soft surface, preserving their puffy silhouette.
    remesh = obj.modifiers.new('Continuous cloud surface', 'REMESH')
    remesh.mode = 'VOXEL'; remesh.voxel_size = .075; remesh.use_smooth_shade = True
    bpy.ops.object.modifier_apply(modifier=remesh.name)
    smooth = obj.modifiers.new('Soft cloud transitions', 'SMOOTH'); smooth.factor=.65; smooth.iterations=5
    bpy.ops.object.modifier_apply(modifier=smooth.name)
    sub = obj.modifiers.new('Cloud surface detail', 'SUBSURF'); sub.levels=1
    bpy.ops.object.modifier_apply(modifier=sub.name)
    for poly in obj.data.polygons: poly.use_smooth=True
    obj.name = room.name + '_puffy_cloud'

def assembly(room):
    # The existing source already has corrected seats. Raise the seated torso and
    # knees another 12 cm, blending down the lower leg to keep shoes on the floor.
    for figure in [obj for obj in room.children if obj.name.startswith('Room inhabitant') and obj.location.y < 0]:
        local_lift = .12 / figure.scale.z
        for obj in figure.children_recursive:
            if obj.type != 'MESH': continue
            inverse = obj.matrix_local.inverted()
            for vertex in obj.data.vertices:
                local = obj.matrix_local @ vertex.co
                amount = max(0, min(1, (local.z - .30) / .27))
                local.z += local_lift * amount
                vertex.co = inverse @ local
            obj.data.update()
    # Preserve parented objects and orbit transforms. Split only merged root meshes,
    # by connected component, so no furniture is sliced across a reveal boundary.
    groups = {stage: empty('assembly_layer_'+str(stage)+'_'+room.name, room, stage) for stage in range(5)}
    for obj in list(room.children):
        if obj.name.startswith('assembly_'): continue
        if obj.type == 'EMPTY':
            obj['reveal_order'] = 4 if obj.name.startswith('orbit_system') else 3 if obj.name.startswith('hotspot_') else 2
            continue
        if obj.type != 'MESH': continue
        bm = bmesh.new(); bm.from_mesh(obj.data); bm.verts.ensure_lookup_table()
        visited=set(); assignments={}
        for vertex in bm.verts:
            if vertex.index in visited: continue
            component=[]; stack=[vertex]; visited.add(vertex.index)
            while stack:
                v=stack.pop(); component.append(v)
                for edge in v.link_edges:
                    other=edge.other_vert(v)
                    if other.index not in visited: visited.add(other.index); stack.append(other)
            zs=[(obj.matrix_local @ v.co).z for v in component]
            high=max(zs); center=sum(zs)/len(zs)
            stage=0 if high<.24 else 1 if high<.75 else 2 if center<1.0 else 3 if center<1.7 else 4
            for v in component: assignments[v.index]=stage
        bm.free()
        for stage in sorted(set(assignments.values())):
            piece=bmesh.new(); piece.from_mesh(obj.data); piece.verts.ensure_lookup_table()
            bmesh.ops.delete(piece, geom=[v for v in piece.verts if assignments[v.index]!=stage], context='VERTS')
            mesh=bpy.data.meshes.new(obj.name+'_layer_'+str(stage)); piece.to_mesh(mesh); piece.free()
            for material in obj.data.materials: mesh.materials.append(material)
            part=bpy.data.objects.new(mesh.name,mesh); bpy.context.collection.objects.link(part)
            part.parent=groups[stage]; part.matrix_basis=obj.matrix_basis.copy()
        bpy.data.objects.remove(obj,do_unlink=True)
    cloud(room)

def lathe(name, profile, material, parent):
    vertices=[]; faces=[]; segments=64
    # Model a horizontal rocket with its nose pointing along +X.
    for x,radius in profile:
        for i in range(segments):
            angle=i*math.tau/segments
            vertices.append((x,math.cos(angle)*radius,math.sin(angle)*radius))
    for j in range(len(profile)-1):
        for i in range(segments):
            a=j*segments+i; b=j*segments+(i+1)%segments
            faces.append((a,b,b+segments,a+segments))
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(vertices,[],faces); mesh.materials.append(material)
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj); obj.parent=parent
    for face in mesh.polygons: face.use_smooth=True
    return obj

rocket=empty('rocket')
lathe('Ivory rocket fuselage',[(-.46,.10),(-.42,.18),(-.31,.205),(.28,.205),(.40,.18)],ivory,rocket)
lathe('Brass ogive nose',[(.38,.183),(.48,.158),(.57,.12),(.64,.072),(.69,.012),(.70,0)],brass,rocket)
lathe('Brass tail collar',[(-.47,.11),(-.47,.19),(-.40,.19),(-.40,.18)],brass,rocket)
lathe('Exhaust nozzle',[(-.61,.13),(-.48,.085),(-.45,.09)],obsidian,rocket)
lathe('Nose seam',[(.32,.207),(.34,.207)],brass,rocket)
for i in range(4):
    angle=i*math.pi/2
    verts=[]
    for side in [-.022,.022]:
        for x,r in [(-.43,.16),(-.52,.40),(-.20,.35),(-.07,.185)]:
            verts.append((x,math.cos(angle)*r-math.sin(angle)*side,math.sin(angle)*r+math.cos(angle)*side))
    faces=[(0,1,2,3),(7,6,5,4)]+[(j,(j+1)%4,(j+1)%4+4,j+4) for j in range(4)]
    mesh=bpy.data.meshes.new('Swept brass fin'); mesh.from_pydata(verts,[],faces); mesh.materials.append(brass)
    obj=bpy.data.objects.new('Swept brass fin',mesh); bpy.context.collection.objects.link(obj); obj.parent=rocket
    bevel=obj.modifiers.new('Rounded fin edge','BEVEL'); bevel.width=.013; bevel.segments=3
    bpy.context.view_layer.objects.active=obj; bpy.ops.object.modifier_apply(modifier=bevel.name)
sphere('Rocket porthole',(0,-.188,.07),(.112,.043,.112),glass,rocket)
bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=12,location=(0,-.219,.07),major_radius=.115,minor_radius=.016,rotation=(math.pi/2,0,0))
window=bpy.context.object; window.name='Brass porthole rim'; window.parent=rocket; window.data.materials.append(brass)
for p in window.data.polygons:p.use_smooth=True
exhaust=empty('rocket_exhaust',rocket)
lathe('Golden exhaust',[(-.58,.085),(-.72,.10),(-.88,.047),(-1.08,0)],fire,exhaust)
lathe('Ivory exhaust core',[(-.60,.042),(-.74,.05),(-.91,0)],ivory,exhaust)

rooms=[bpy.data.objects[name] for name in ['engineering','impact','about']]
if any(child.name.startswith('assembly_cloud') for room in rooms for child in room.children):
    raise ValueError('Use the unaugmented rooms-base.blend input; these rooms already contain cloud islands.')
for room in rooms:
    room.location=(0,0,0)
    assembly(room)
for asset in rooms+[rocket]:
    bpy.ops.object.select_all(action='DESELECT'); asset.select_set(True)
    for child in asset.children_recursive:child.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(out/(asset.name+'.glb')),export_format='GLB',use_selection=True,export_extras=True,export_cameras=False,export_lights=False)
for i,room in enumerate(rooms):room.location.x=(i-1)*5
rocket.location=(2.5,-2,-.12); rocket.scale=(.55,.55,.55)
connections=bpy.data.objects.get('connections')
if connections:
    connections.hide_render=False
    for child in connections.children_recursive:child.hide_render=False
for child in bpy.data.objects:
    if child.name.startswith('orbit_'):child.hide_render=True
scene=bpy.context.scene
scene.cycles.samples=32
scene.camera.data.ortho_scale=16.4
scene.camera.rotation_euler=(Vector((0,0,.6))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_y=1060
scene.render.filepath=str(out/'blender-worlds-preview.png')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'kevin-worlds.blend'))
bpy.ops.render.render(write_still=True)
print('Cloud worlds and rocket exported:',out)
