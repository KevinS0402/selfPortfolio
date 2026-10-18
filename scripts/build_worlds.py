"""Build Kevin's original miniature rooms in Blender and export web-ready GLBs.
Run: blender --background --python scripts/build_worlds.py -- <output-directory>
"""
import bpy
import math
import random
import sys
from pathlib import Path
from mathutils import Vector, Matrix

out = Path(sys.argv[sys.argv.index('--') + 1])
out.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metal=0, glow=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Metallic'].default_value = metal
    bs.inputs['Roughness'].default_value = .35 if metal else .65
    bs.inputs['Emission Color'].default_value = (*color, 1)
    bs.inputs['Emission Strength'].default_value = glow
    return m

dark = material('Obsidian', (.035,.031,.028), .1)
gold = material('Warm brass', (.66,.43,.12), .55)
light = material('Ivory', (.78,.70,.48), .15)
screen = material('Screen glow', (.48,.32,.10), .25,.35)
sage = material('Muted botanical green', (.13,.19,.12))
fabric = material('Woven charcoal', (.065,.053,.042))
skin = material('Sculpted porcelain', (.68,.57,.38))
warm_glow = material('Warm lamp glow', (1,.63,.22), 0, 2.2)
paper = material('Warm paper', (.63,.57,.42))
wood = material('Smoked timber', (.06,.045,.033))
def surface_texture(mat,name,woven=False):
    size=256
    rng=random.Random(17 if woven else 23)
    image=bpy.data.images.new(name,width=size,height=size)
    pixels=[]
    for y in range(size):
        for x in range(size):
            if woven:
                grain=(.024 if x%5<2 else 0)+(.015 if y%5<2 else 0)+rng.uniform(-.006,.006)
                base=.12+grain
            else:
                grain=math.sin(y*.22+math.sin(x*.034)*2)*.012+math.sin(y*.84+x*.01)*.006+rng.uniform(-.004,.004)
                base=.17+grain
            pixels.extend((base,base*.87,base*.72,1))
    image.pixels.foreach_set(pixels)
    image.filepath_raw=str(out/(name+'.png'));image.file_format='PNG';image.save();image.pack()
    texture=mat.node_tree.nodes.new('ShaderNodeTexImage');texture.image=image
    mat.node_tree.links.new(texture.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    mat.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.88 if woven else .64
surface_texture(wood,'charcoal-timber-grain')
surface_texture(fabric,'charcoal-woven-fabric',True)
all_materials = [wood,dark,gold,light,screen,sage,fabric,skin,warm_glow,paper]
root = None
active_prop = None

def finish(obj, name, mat):
    obj.name = name
    obj.data.materials.append(mat)
    obj.parent = active_prop or root
    return obj

def box(name, loc, size, mat=dark, bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new('Soft manufactured edges','BEVEL')
        modifier.width = bevel
        modifier.segments = 4
        modifier.harden_normals = True
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return finish(obj,name,mat)

def cylinder(name, loc, radius, depth, mat=gold, vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    for p in obj.data.polygons: p.use_smooth = True
    return finish(obj,name,mat)

def sphere(name, loc, radius, mat=gold):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=radius, location=loc)
    obj=bpy.context.object
    for p in obj.data.polygons: p.use_smooth=True
    return finish(obj,name,mat)

def line(name, points, radius=.015, mat=gold, closed=False):
    curve=bpy.data.curves.new(name,'CURVE')
    curve.dimensions='3D'
    curve.bevel_depth=radius
    curve.bevel_resolution=2
    spline=curve.splines.new('POLY')
    spline.points.add(len(points)-1)
    for p, xyz in zip(spline.points,points): p.co=(*xyz,1)
    spline.use_cyclic_u=closed
    obj=bpy.data.objects.new(name,curve)
    bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat)

def rectangle(name,x,y,z,w,d):
    return line(name,[(x-w/2,y-d/2,z),(x+w/2,y-d/2,z),(x+w/2,y+d/2,z),(x-w/2,y+d/2,z)],closed=True)

def prop(name):
    global active_prop
    obj=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(obj)
    obj.parent=root
    active_prop=obj
    return obj

def plant(x,y,scale=1):
    # Tapered leaves with a curved midrib and changing width, not spheres.
    bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=.14*scale,radius2=.19*scale,depth=.36*scale,location=(x,y,.22*scale))
    finish(bpy.context.object,'Tapered ceramic planter',dark)
    cylinder('Planter rim',(x,y,.39*scale),.20*scale,.03*scale,gold)
    cylinder('Potting soil',(x,y,.397*scale),.177*scale,.01*scale,fabric)
    for i in range(9):
        angle=i*2.4
        height=(.64+(i%4)*.13)*scale
        tip=(x+math.cos(angle)*.30*scale,y+math.sin(angle)*.30*scale,height)
        line('Botanical stem',[(x,y,.39*scale),tip],.007*scale,sage)
        origin=Vector(tip);forward=Vector((math.cos(angle)*.39*scale,math.sin(angle)*.39*scale,.13*scale));cross=Vector((-math.sin(angle),math.cos(angle),0))
        verts=[]
        for j in range(13):
            t=j/12;center=origin+forward*t+Vector((0,0,math.sin(t*math.pi)*.12*scale))
            half=math.sin(t*math.pi)**.8*.11*scale
            verts.extend([tuple(center-cross*half),tuple(center+Vector((0,0,.014*scale))),tuple(center+cross*half)])
        faces=[]
        for j in range(12):
            for k in range(2):faces.append((j*3+k,j*3+k+1,(j+1)*3+k+1,(j+1)*3+k))
        mesh=bpy.data.meshes.new('Curved leaf');mesh.from_pydata(verts,[],faces);mesh.update()
        leaf=bpy.data.objects.new('Natural leaf',mesh);bpy.context.collection.objects.link(leaf)
        finish(leaf,'Natural leaf',sage)
        for poly in mesh.polygons:poly.use_smooth=True
        line('Leaf midrib',[tuple(origin+forward*(j/12)+Vector((0,0,math.sin(j/12*math.pi)*.12*scale+.014*scale))) for j in range(13)],.003*scale,light)

def arch(x,y,width,height):
    radius=width/2
    spring=height-radius
    points=[(x-radius,y,.18),(x-radius,y,spring)]
    points += [(x+math.cos(math.pi-i*math.pi/32)*radius,y,spring+math.sin(math.pi-i*math.pi/32)*radius) for i in range(33)]
    points.append((x+radius,y,.18))
    line('Architectural arch',points,.045)
    line('Arch inset',[(px,py-.06,pz*.96) for px,py,pz in points],.012)
    for side in [-1,1]:
        box('Arch plinth',(x+side*radius,y,.24),(.22,.23,.35),gold)

def books(x,y,z,count=5):
    for i in range(count):
        h=.30+(i%3)*.055
        box('Book spine',(x+i*.105,y,z+h/2),(.08,.20,h),gold if i%2 else light,.008)
        line('Spine stripe',[(x+i*.105-.026,y-.105,z+.08),(x+i*.105+.026,y-.105,z+.08)],.005,dark)

def shelf(x,y):
    for h in [.35,.92,1.49,2.06]:
        box('Shelf',(x,y,h),(.92,.40,.065),dark)
        line('Shelf lip',[(x-.46,y-.21,h),(x+.46,y-.21,h)],.012)
    for xx in [x-.43,x+.43]: box('Shelf support',(xx,y,1.2),(.055,.35,2.2),gold)
    books(x-.32,y,.95)
    books(x-.3,y,1.52,4)
    cylinder('Shelf vessel',(x+.2,y,.48),.08,.20,light)

def chair(x,y,angle=0):
    before = set(bpy.data.objects) if angle else set()
    box('Chair seat',(x,y,.58),(.55,.51,.10),fabric)
    box('Chair back',(x,y+.22,.93),(.55,.09,.65),fabric,.07)
    rectangle('Seat piping',x,y,.635,.53,.49)
    for dx,dy in [(-.20,-.18),(.20,-.18),(-.20,.18),(.20,.18)]:
        line('Chair legs',[(x+dx,y+dy,.53),(x+dx*1.2,y+dy*1.2,.17)],.025)

    if angle:
        pivot = Vector((x,y,0))
        rotation = Matrix.Translation(pivot) @ Matrix.Rotation(angle,4,'Z') @ Matrix.Translation(-pivot)
        for obj in set(bpy.data.objects) - before: obj.matrix_world = rotation @ obj.matrix_world

def rug(x,y,w,d):
    box('Woven area rug',(x,y,.16),(w,d,.025),fabric,.05)
    for inset in [0,.07]:
        line('Rug stitched border',[(x-w/2+.07+inset,y-d/2+.07+inset,.177),(x+w/2-.07-inset,y-d/2+.07+inset,.177),(x+w/2-.07-inset,y+d/2-.07-inset,.177),(x-w/2+.07+inset,y+d/2-.07-inset,.177)],.006,light,True)
    for i in range(17):
        xx=x-w/2+.1+i*(w-.2)/16
        for side in [-1,1]:line('Rug fringe',[(xx,y+side*d/2,.16),(xx,y+side*(d/2+.055),.16)],.004,light)

def person(x,y,seated=False,angle=0,scale=1):
    global active_prop
    previous=active_prop
    group=prop('Room inhabitant')
    seat_lift = .635 - .715*scale if seated else 0
    group.location=(x,y,seat_lift)
    group.rotation_euler.z=angle
    group.scale=(scale,scale,scale)
    # Small sculptural figures, rather than portraits or representations of real people.
    hip=.78 if seated else .98
    torso=sphere('Soft jacket',(0,0,hip+.22),.21,dark)
    torso.scale=(.95,.7,1.4)
    head=sphere('Porcelain head',(0,0,hip+.68),.135,skin)
    head.scale=(.90,.90,1.08)
    hair=sphere('Hair cap',(0,.035,hip+.75),.13,dark)
    hair.scale=(.98,.94,.65)
    line('Jacket seam',[(0,-.14,hip+.10),(0,-.14,hip+.40)],.008,gold)
    for side in [-1,1]:
        if seated:
            knee=(side*.11,-.30,.57)
            foot=(side*.11,-.32,.25-seat_lift/scale)
            line('Trouser leg',[(side*.10,0,hip),knee,foot],.065,fabric)
            hand=(side*.24,-.37,hip+.22)
            line('Bent sleeve',[(side*.17,0,hip+.37),(side*.28,-.17,hip+.16),hand],.053,dark)
        else:
            foot=(side*.12,-.03,.25)
            line('Trouser leg',[(side*.10,0,hip),foot],.068,fabric)
            hand=(side*.24,-.03,hip-.12)
            line('Jacket sleeve',[(side*.17,0,hip+.37),(side*.26,0,hip+.10),hand],.055,dark)
        shoe=sphere('Shoe',foot,.08,dark); shoe.scale=(1,1.6,.65)
        sphere('Hand',hand,.042,skin)
    active_prop=previous

def floor_lamp(x,y):
    cylinder('Floor lamp base',(x,y,.19),.23,.07,dark)
    line('Lamp stem',[(x,y,.22),(x,y,1.95)],.023,gold)
    cylinder('Pleated lamp shade',(x,y,2.02),.27,.38,light,32)
    for i in range(16):
        a=i*math.tau/16
        line('Shade seam',[(x+math.cos(a)*.272,y+math.sin(a)*.272,1.84),(x+math.cos(a)*.272,y+math.sin(a)*.272,2.20)],.006,gold)
    cylinder('Lamp diffuser',(x,y,1.82),.23,.025,warm_glow)

def tabletop_plant(x,y,z):
    cylinder('Desk planter',(x,y,z+.06),.075,.12,light)
    for i in range(5):
        a=i*math.tau/5
        leaf=sphere('Small plant leaf',(x+math.cos(a)*.055,y+math.sin(a)*.055,z+.20),.05,sage)
        leaf.scale=(.6,1.8,.3);leaf.rotation_euler=(.3,a,.3)

def wall_clock(x,y,z):
    face=cylinder('Wall clock',(x,y,z),.22,.04,dark,32);face.rotation_euler.x=math.pi/2
    line('Clock rim',[(x+math.cos(i*math.tau/48)*.225,y-.03,z+math.sin(i*math.tau/48)*.225) for i in range(48)],.008,gold,True)
    line('Clock hands',[(x-.09,y-.04,z+.09),(x,y-.04,z),(x+.105,y-.04,z+.04)],.012,light)

def mug(x,y,z):
    cylinder('Coffee cup',(x,y,z+.07),.067,.14,light)
    cylinder('Coffee',(x,y,z+.143),.053,.004,dark)
    line('Mug handle',[(x+.055,y,z+.04),(x+.10,y,z+.04),(x+.11,y,z+.11),(x+.055,y,z+.11)],.010,gold)

def orbit_icon(kind):
    # Native modeled symbols; each travels with its 3D orbital plane.
    disk=cylinder('Orbit icon badge',(0,0,0),.15,.035,dark,24)
    disk.rotation_euler.x=math.pi/2
    def stroke(points,closed=False):
        line('Orbit '+kind,[(x,-.025,z) for x,z in points],.009,light,closed)
    if kind=='code':
        stroke([(-.035,.07),(-.095,0),(-.035,-.07)])
        stroke([(.035,.07),(.095,0),(.035,-.07)])
        stroke([(.02,.08),(-.02,-.08)])
    elif kind=='chip':
        stroke([(-.06,-.06),(.06,-.06),(.06,.06),(-.06,.06)],True)
        for side in [-1,1]:
            for offset in [-.025,.025]:
                stroke([(side*.06,offset),(side*.105,offset)])
                stroke([(offset,side*.06),(offset,side*.105)])
    elif kind=='chart':
        stroke([(-.09,.085),(-.09,-.075),(.10,-.075)])
        stroke([(-.06,-.04),(-.02,.03),(.035,0),(.085,.08)])
    elif kind=='globe':
        for width in [.09,.04]:
            stroke([(math.cos(i*math.tau/32)*width,math.sin(i*math.tau/32)*.09) for i in range(32)],True)
        stroke([(-.09,0),(.09,0)])
    elif kind=='book':
        stroke([(0,.06),(-.10,.09),(-.10,-.06),(0,-.09),(.10,-.06),(.10,.09),(0,.06),(0,-.09)])
    elif kind=='notes':
        stroke([(-.04,-.04),(-.04,.075),(.07,.10),(.07,-.01)])
        for x,z in [(-.065,-.055),(.045,-.025)]:
            stroke([(x+math.cos(i*math.tau/20)*.027,z+math.sin(i*math.tau/20)*.017) for i in range(20)],True)
    elif kind=='people':
        stroke([(math.cos(i*math.tau/24)*.033,.04+math.sin(i*math.tau/24)*.033) for i in range(24)],True)
        stroke([(-.065,-.09),(-.065,-.04),(0,0),(.065,-.04),(.065,-.09)])
        for side in [-1,1]:stroke([(side*.085,.045),(side*.10,0),(side*.085,-.06)])
    elif kind=='bulb':
        stroke([(math.cos(i*math.tau/32)*.065,.035+math.sin(i*math.tau/32)*.065) for i in range(32)],True)
        stroke([(-.025,-.03),(-.025,-.065),(.025,-.065),(.025,-.03)])
        stroke([(-.02,-.09),(.02,-.09)])

def orbit_system(room_name):
    global active_prop
    system=prop('orbit_system')
    glyphs=['code','chip','chart','globe'] if room_name=='engineering' else ['people','book','notes','bulb']
    for i,kind in enumerate(glyphs):
        active_prop=None
        plane=prop('orbit_plane_'+str(i))
        plane.parent=system
        plane.location.z=1.18
        plane.rotation_euler=(math.radians([12,-18,28,-8][i]),math.radians([-9,14,-12,20][i]),math.radians([-18,10,-7,23][i]))
        active_prop=plane
        radius=(2.16+i*.17)*(1.10 if room_name=='impact' else 1)
        line('Visible 3D orbit',[(math.cos(j*math.tau/96)*radius,math.sin(j*math.tau/96)*radius,0) for j in range(96)],.008,gold,True)
        pivot=prop('orbit_pivot_'+str(i));pivot.parent=plane
        pivot.rotation_euler.z=i*math.tau/4
        pivot['orbit_duration']=7+i
        icon=prop('orbit_icon_'+kind);icon.parent=pivot
        icon.location.x=radius
        orbit_icon(kind)
    active_prop=None

def shared_room(name):
    global root,active_prop
    root=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(root)
    active_prop=None
    box('Floating room foundation',(0,0,.02),(4.0,3.45,.20),dark,.16)
    rectangle('Brass foundation rim',0,0,.12,3.84,3.29)
    for row in range(12):
        for col in range(3):
            box('Timber floor board',(-1.28+col*1.28,-1.43+row*.26,.133),(1.26,.247,.025),wood,.004)
    arch(-.92,1.4,1.5,2.9)
    arch(.78,1.4,1.35,2.55)
    plant(-1.57,1.05,1.18)
    plant(1.60,-.95,.85)
    floor_lamp(1.65,1.12)
    wall_clock(-.9,1.36,2.14)
    rug(0,-.35,2.88,2.28)
    return root

rooms=[]
rooms.append(shared_room('engineering'))
shelf(1.4,1.10)
box('Workbench',(0,-.18,1.05),(2.65,1.12,.12),wood)
rectangle('Desk edge',0,-.18,1.12,2.62,1.10)
for x in [-1.15,1.15]:
    box('Desk pedestal',(x,-.18,.58),(.26,.76,.86),dark)
    for z in [.45,.70,.9]: line('Drawer trim',[(x-.12,-.58,z),(x+.12,-.58,z)],.01)
chair(-.46,-1.20,angle=math.pi)
person(-.46,-1.20,seated=True,angle=math.pi,scale=.78)
prop('hotspot_songsearch')
box('Laptop base',(-.25,-.36,1.16),(1.02,.68,.06),gold)
lid=box('Laptop screen',(-.25,-.03,1.51),(1.02,.055,.66),dark)
lid.rotation_euler.x=-.12
box('Luminous display',(-.25,-.071,1.51),(.87,.012,.52),screen,.008)
for i in range(11):
    h=.08+abs(math.sin(i*.9))*.26
    line('Audio signal',[(-.63+i*.078,-.081,1.51-h/2),(-.63+i*.078,-.081,1.51+h/2)],.009,light)
box('Laptop trackpad',(-.25,-.56,1.197),(.29,.15,.008),dark,.014)
line('Laptop hinge',[(-.70,-.055,1.20),(.20,-.055,1.20)],.016,gold)
for row in range(4):
    for col in range(11): box('Keyboard',(-.65+col*.078,-.2-row*.08,1.2),(.055,.055,.006),dark,.002)
prop('hotspot_signlect')
box('Edge device',(1.13,-.28,1.28),(.42,.34,.24),gold)
box('Camera housing',(1.13,-.28,1.51),(.29,.18,.20),dark)
for dx in [-.18,.18]:
    for dy in [-.13,.13]:cylinder('Device fixing screw',(1.13+dx,-.28+dy,1.41),.014,.009,light,16)
for i in range(4):box('Device vent',(1.01+i*.075,-.454,1.28),(.045,.007,.035),dark,.004)
lens=cylinder('Camera lens',(1.13,-.40,1.51),.07,.055,light)
lens.rotation_euler.x=math.pi/2
prop('hotspot_canary')
box('Weather display',(-1.15,-.23,1.46),(.46,.065,.54),gold)
box('Weather screen',(-1.15,-.275,1.46),(.38,.012,.42),dark)
line('Weather chart',[(-1.30,-.285,1.38),(-1.23,-.285,1.48),(-1.14,-.285,1.42),(-1.03,-.285,1.59)],.011,light)
active_prop=None
books(-.8,1.05,.16,6)
tabletop_plant(.77,-.52,1.12)
mug(.60,-.08,1.12)
box('Notebook',(.62,-.34,1.15),(.30,.23,.025),paper,.01)
line('Desk pen',[(.52,-.36,1.18),(.72,-.29,1.18)],.008,gold)
line('Desk lamp arm',[(-1.04,.09,1.13),(-1.04,.09,1.77),(-.78,.09,1.90)],.018,gold)
shade=box('Desk lamp hood',(-.75,.09,1.86),(.28,.18,.10),dark)
box('Desk lamp glow',(-.75,.09,1.80),(.22,.14,.018),warm_glow,.01)
box('Engineering wall display',(.8,1.34,2.03),(.60,.025,.43),gold)
box('Drawing sheet',(.8,1.31,2.03),(.54,.015,.37),paper)
line('Sketch connections',[(.60,1.29,2.05),(.72,1.29,2.13),(.85,1.29,1.92),(1,1.29,2.06)],.008,dark)
orbit_system('engineering')

rooms.append(shared_room('impact'))
shelf(-1.42,.45)
prop('hotspot_developit')
box('Teaching board',(0,1.12,1.92),(1.88,.10,1.10),gold)
box('Board face',(0,1.05,1.92),(1.76,.015,.98),dark)
line('Code bracket',[(-.5,1.025,2.12),(-.68,1.025,1.92),(-.5,1.025,1.72)],.017,light)
line('Code bracket',[(.5,1.025,2.12),(.68,1.025,1.92),(.5,1.025,1.72)],.017,light)
line('Code slash',[(.16,1.025,2.15),(-.16,1.025,1.68)],.017)
active_prop=None
cylinder('Round community table',(0,-.2,.92),.93,.12,dark,48)
cylinder('Table brass edge',(0,-.2,.97),.945,.035,gold,48)
cylinder('Table stem',(0,-.2,.54),.12,.70,gold)
cylinder('Table foot',(0,-.2,.2),.5,.07,dark)
chair(-1,-.65,angle=math.atan2(1,-.45))
chair(1,-.65,angle=math.atan2(-1,-.45))
chair(0,-1.40,angle=math.pi)
person(-1,-.65,seated=True,angle=math.atan2(1,-.45),scale=.75)
person(1,-.65,seated=True,angle=math.atan2(-1,-.45),scale=.75)
person(-.90,.65,angle=.3,scale=.83)
tabletop_plant(.56,-.04,.99)
mug(-.58,-.28,.99)
box('Workshop notebook',(.05,.31,1.04),(.40,.28,.04),paper,.01)
for i in range(3):box('Community notice',(.55+i*.21,1.03,2.25),(.16,.012,.12),paper,.008)
prop('hotspot_mnps')
for side in [-1,1]:
    page=box('Open music toolkit',(side*.22,-.25,1.06),(.43,.60,.045),light,.008)
    page.rotation_euler.y=side*-.10
    for j in range(5): line('Page staff',[(side*.22-.17,-.43+j*.075,1.10),(side*.22+.17,-.43+j*.075,1.10)],.004,gold)
prop('hotspot_studio')
box('Portable recording unit',(1.43,.45,.78),(.48,.42,1.25),dark)
for z,r in [(.55,.13),(.97,.08)]:
    disk=cylinder('Speaker',(1.43,.225,z),r,.025,gold)
    disk.rotation_euler.x=math.pi/2
active_prop=None
orbit_system('impact')

rooms.append(shared_room('about'))
for x in [-1.5,-1.3,-1.1,-.9,-.7,-.5,-.3,-.1,.1,.3,.5,.7,.9,1.1,1.3,1.5]:
    box('Acoustic diffuser',(x,1.25,1.05),(.075,.16,1.7),dark)
    line('Acoustic brass edge',[(x,1.15,.25),(x,1.15,1.90)],.007)
box('Studio desk',(0,.30,.85),(2.12,.95,.12),wood)
for x in [-.85,.85]:box('Studio legs',(x,.3,.49),(.12,.65,.64),gold)
prop('hotspot_ksong')
box('Mixing console',(0,.23,.97),(1.64,.65,.12),gold)
box('Console panel',(0,.23,1.04),(1.51,.57,.018),dark)
for col in range(11):
    x=-.65+col*.13
    line('Fader slot',[(x,.04,1.055),(x,.28,1.055)],.009,gold)
    box('Fader cap',(x,.08+(col%4)*.04,1.075),(.055,.065,.018),light,.004)
    for y in [.37,.45]:
        cylinder('Mixer knob',(x,y,1.075),.028,.04,gold,32)
        line('Knob index',[(x,y,1.097),(x,y-.016,1.097)],.003,light)
    for y in [.04,.12,.20,.28]:
        line('Fader scale',[(x-.027,y,1.060),(x-.015,y,1.060)],.002,light)
for x in [-1.4,1.4]:
    box('Studio monitor',(x,.6,1.2),(.42,.4,.65),dark)
    for z,r in [(1.12,.12),(1.4,.065)]:
        driver=cylinder('Studio speaker',(x,.387,z),r,.02,gold)
        driver.rotation_euler.x=math.pi/2
prop('hotspot_microphone')
cylinder('Microphone stand',(-1.2,-.8,.88),.023,1.5,gold)
cylinder('Mic base',(-1.2,-.8,.17),.26,.065,dark)
cylinder('Microphone grille',(-1.2,-.8,1.77),.085,.29,light)
for z in [1.66,1.7,1.74,1.78,1.82,1.86]:cylinder('Grille ring',(-1.2,-.8,z),.087,.008,gold)
pop=cylinder('Pop filter',(-1.2,-1.02,1.76),.14,.015,dark)
pop.rotation_euler.x=math.pi/2
line('Filter arm',[(-1.2,-.8,1.46),(-1.2,-1.02,1.76)],.009)
prop('hotspot_record')
box('Record cabinet',(1.10,-.98,.48),(1.18,.73,.68),dark)
rectangle('Record cabinet rim',1.10,-.98,.83,1.15,.7)
cylinder('Turntable',(1.08,-.97,.86),.27,.024,gold,48)
cylinder('Vinyl',(1.08,-.97,.88),.245,.018,dark,48)
cylinder('Record label',(1.08,-.97,.895),.074,.01,light)
for radius in [.12,.16,.20,.225]:
    line('Vinyl groove',[(1.08+math.cos(i*math.tau/80)*radius,-.97+math.sin(i*math.tau/80)*radius,.893) for i in range(80)],.0018,gold,True)
cylinder('Turntable spindle',(1.08,-.97,.91),.010,.038,gold)
line('Tone arm',[(1.56,-.83,.90),(1.51,-1.07,.94),(1.33,-1.17,.94)],.014)
for i in range(9):box('Vinyl sleeve',(.65+i*.10,-1.10,.52),(.045,.37,.38),gold if i%3 else light,.004)
active_prop=None
chair(0,-.75,angle=math.pi)
person(0,-.75,seated=True,angle=math.pi,scale=.75)
tabletop_plant(.99,.42,.92)
mug(-.97,.23,.92)
box('Lyric notebook',(.65,-.48,.19),(.45,.30,.045),paper,.008)
line('Lyric pen',[(.51,-.42,.22),(.79,-.52,.22)],.009,gold)
for i in range(3):
    sleeve=box('Wall album art',(-.57+i*.57,1.13,2.16),(.45,.03,.45),gold,.01)
    face=box('Album print',(-.57+i*.57,1.10,2.16),(.38,.01,.38),dark,.004)
    line('Abstract sound artwork',[(-.72+i*.57,1.08,2.10),(-.61+i*.57,1.08,2.24),(-.51+i*.57,1.08,2.08),(-.43+i*.57,1.08,2.18)],.012,light)

# The homepage is connected by two paired audio/data cables. Chapters load no connectors.
root=bpy.data.objects.new('connections',None);bpy.context.collection.objects.link(root)
connections=root;active_prop=None
for start in [-3,2]:
    for offset in [-.045,.045]:
        pts=[]
        for i in range(41):
            t=i/40
            pts.append((start-.10+t*1.20,-1.42+offset-math.sin(t*math.pi)*.18,.22-math.sin(t*math.pi)*.11))
        line('Braided connecting cable',pts,.027,dark)
        line('Brass cable tracer',[(x,y,z+.024) for x,y,z in pts],.006,gold)
        for x in [start-.10,start+1.10]:
            jack=cylinder('Brass connector',(x,-1.42+offset,.22),.050,.13,gold,32);jack.rotation_euler.y=math.pi/2
            cuff=cylinder('Cable strain relief',(x,-1.42+offset,.22),.055,.05,dark,32);cuff.rotation_euler.y=math.pi/2

# Merge meshes by material within their parent, preserving the orbit transforms.
for room in rooms+[connections]:
    parents=[room]+[o for o in room.children_recursive if o.type=='EMPTY']
    for parent in parents:
        meshes=[o for o in parent.children if o.type in {'MESH','CURVE'}]
        for obj in meshes:
            if obj.type=='CURVE':
                bpy.ops.object.select_all(action='DESELECT')
                obj.select_set(True)
                bpy.context.view_layer.objects.active=obj
                bpy.ops.object.convert(target='MESH')
        for mat in all_materials:
            batch=[o for o in parent.children if o.type=='MESH' and o.data.materials and o.data.materials[0]==mat]
            if not batch:continue
            bpy.ops.object.select_all(action='DESELECT')
            for obj in batch:obj.select_set(True)
            bpy.context.view_layer.objects.active=batch[0]
            bpy.ops.object.join()
            bpy.context.object.name=parent.name+'_'+mat.name
    bpy.ops.object.select_all(action='DESELECT')
    room.select_set(True)
    for child in room.children_recursive:child.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(out/(room.name+'.glb')), export_format='GLB', use_selection=True, export_extras=True, export_cameras=False, export_lights=False)

for i,room in enumerate(rooms):
    room.location.x=(i-1)*5.0
    for child in room.children_recursive:
        if child.name.startswith('orbit_') or child.parent and child.parent.name.startswith('orbit_'):child.hide_render=True
world=bpy.context.scene.world
world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.009,.009,.012,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.3
for name,loc,energy,color,size in [('Key',(0,-4,8),2400,(1,.91,.72),8),('Rim',(0,5,7),3200,(1,.66,.20),8),('Fill',(-7,-1,4),900,(.7,.8,1),5)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    lamp=bpy.context.object
    lamp.name=name
    lamp.data.energy=energy
    lamp.data.color=color
    lamp.data.shape='DISK'
    lamp.data.size=size
    lamp.rotation_euler=(Vector((0,0,1))-lamp.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,-13,8))
camera=bpy.context.object
camera.rotation_euler=(Vector((0,0,1.1))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'
camera.data.ortho_scale=15.3
bpy.context.scene.camera=camera
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=64
scene.cycles.use_denoising=True
scene.render.resolution_x=2400
scene.render.resolution_y=870
scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(out/'blender-worlds-preview.png')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'kevin-worlds.blend'))
bpy.ops.render.render(write_still=True)
print('Kevin worlds saved and exported:',out)
