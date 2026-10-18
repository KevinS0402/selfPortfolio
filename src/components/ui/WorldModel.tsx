"use client";

import { media } from "@/data/media";
import { Arrow } from "./Arrow";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Group, Mesh, MeshStandardMaterial, Object3D } from "three";

export type WorldIndex = 0 | 1 | 2;
const worlds = ["engineering", "impact", "about"] as const;

export function WorldModel({ mode, space, onSelect, onPreview }: { mode: "overview" | "single"; space: WorldIndex; onSelect?: (space: WorldIndex) => void; onPreview?: (space: WorldIndex | null) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const config = useRef({ space, onSelect, onPreview });
  const invalidate = useRef<() => void>(() => {});
  const action = useRef<(name: "left" | "right" | "reset") => void>(() => {});
  const [status, setStatus] = useState("loading");
  const modelSpace = mode === "single" ? space : 0;
  useEffect(() => { config.current = { space, onSelect, onPreview }; invalidate.current(); }, [space, onSelect, onPreview]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    let idleTask: number | undefined;
    let deferred: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = () => { if (!cancelled) void init().catch(() => { if (!cancelled) setStatus("fallback"); dispose?.(); }); };
      // Let the initial text/image frame and input handlers settle before GPU setup.
      if ("requestIdleCallback" in window) idleTask = window.requestIdleCallback(start, { timeout: 1200 });
      else deferred = setTimeout(start, 100);
    }, { rootMargin: "500px" });
    observer.observe(element);

    async function init() {
      const [THREE, { GLTFLoader }, { OrbitControls }, { RoomEnvironment }, { mergeGeometries }] = await Promise.all([
        import("three"), import("three/addons/loaders/GLTFLoader.js"), import("three/addons/controls/OrbitControls.js"), import("three/addons/environments/RoomEnvironment.js"), import("three/addons/utils/BufferGeometryUtils.js"),
      ]);
      if (cancelled || !element) return;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      const constrained = coarse || memory <= 4 || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
      renderer.shadowMap.enabled = !constrained;
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.setClearColor(0x09090b, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = .95;
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      element.prepend(canvas);
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environment = new RoomEnvironment();
      const environmentMap = pmrem.fromScene(environment, .04);
      scene.environment = environmentMap.texture;
      scene.environmentIntensity = .65;
      environment.dispose?.();
      pmrem.dispose?.();
      scene.add(new THREE.HemisphereLight(0xffe5b1, 0x17141b, .6));
      const key = new THREE.DirectionalLight(0xfff0d0, 1.8);
      key.position.set(-4, 7, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = mode === "overview" ? -9 : -4;
      key.shadow.camera.right = mode === "overview" ? 9 : 4;
      key.shadow.camera.top = 5;
      key.shadow.camera.bottom = -5;
      key.shadow.normalBias = .025;
      key.shadow.bias = -.0002;
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xd6b45e, 1.7);
      rim.position.set(4, 5, -3);
      scene.add(rim);
      const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, .1, 100);
      const target = new THREE.Vector3(0, .8, 0);
      camera.position.set(mode === "single" ? 5 : 0, 6, 13);
      camera.lookAt(target);
      const homePosition = camera.position.clone();
      const controls = mode === "single" ? new OrbitControls(camera, canvas) : null;
      if (controls) {
        controls.target.copy(target);
        controls.enableDamping = true;
        controls.dampingFactor = .09;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.minPolarAngle = .25;
        controls.maxPolarAngle = Math.PI / 2 - .08;
        controls.rotateSpeed = .65;
        controls.update();
      }
      const manager = new THREE.LoadingManager();
      const loader = new GLTFLoader(manager);
      const downloads = new AbortController();
      const loadTimeout = window.setTimeout(() => { manager.abort(); downloads.abort(); }, 18_000);
      // Embedded GLB images use the existing img-src policy, rather than blob fetches.
      loader.register(parser => {
        parser.textureLoader = new THREE.TextureLoader(parser.options.manager)
          .setCrossOrigin(parser.options.crossOrigin);
        return { name: "PORTFOLIO_IMAGE_TEXTURES" };
      });
      const rooms: Group[] = [];
      const materials: MeshStandardMaterial[] = [];
      const textures = new Set<import("three").Texture>();
      const geometries = new Set<import("three").BufferGeometry>();
      const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
      let visible = true;
      const roomMaterials: MeshStandardMaterial[][] = [];
      const satellites: Group[] = [];
      const satelliteIcons: Object3D[] = [];
      const iconOrientation = new THREE.Quaternion();
      let emphasizedSpace = -1;
      let pointerStart: { x: number; y: number } | null = null;
      let mouseX = 0, mouseY = 0;
      let interactionUntil = 0;
      let hoveredRoom: WorldIndex | null = null;
      const roomSprings = Array.from({ length: 3 }, () => ({
        values: [0, 0, 0, 0, 1],
        velocities: [0, 0, 0, 0, 0],
      }));
      const spotlights: { light: import("three").SpotLight; intensity: number }[] = [];
      let revealProgress = 0;
      let revealTime = 0;
      const bridges: { mesh: Mesh; original: Float32Array; weights: Float32Array; indices: Uint8Array; localOffsets: import("three").Vector3[][]; toLocal: import("three").Matrix3 }[] = [];
      const bridgeMaterials: MeshStandardMaterial[] = [];
      const bridgeOffsets = Array.from({ length: 2 }, () => [new THREE.Vector3(), new THREE.Vector3()]);
      const bridgeVertex = new THREE.Vector3();
      const bridgeRest = new THREE.Vector3();
      let previousBridgeTime = 0;
      let previousShadowTime = 0;
      let scrollingUntil = 0;
      function scrolling() { scrollingUntil = performance.now() + 120; }
      window.addEventListener("scroll", scrolling, { passive: true });
      const bridgeDelta = new THREE.Vector3();
      let rocket: Group | null = null;
      let rocketExhaust: Object3D | undefined;
      let flightTime = 0;
      const flightPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-7.2, -.36, 2.3), new THREE.Vector3(-4, -.18, 2.5),
        new THREE.Vector3(-2.5, .65, 1.9), new THREE.Vector3(0, -.25, 2.6),
        new THREE.Vector3(2.5, .65, 1.9), new THREE.Vector3(5, -.1, 2.5),
        new THREE.Vector3(7.2, -.3, 2.2),
      ]);
      const rocketForward = new THREE.Vector3(1, 0, 0);
      const rocketDirection = new THREE.Vector3();
      let currentCenter = mode === "overview" && window.innerWidth < 640 ? (config.current.space - 1) * 5 : 0;
      let frame = 0;
      let previousTime = 0;
      let ready = false;
      function resume() {
        if (!ready || cancelled || !visible || document.hidden || frame) return;
        frame = requestAnimationFrame(render);
      }
      invalidate.current = resume;
      function visibilityChanged() {
        if (!visible || document.hidden) { cancelAnimationFrame(frame); frame = 0; }
        else resume();
      }
      const sizeObserver = new ResizeObserver(resize);
      const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; visibilityChanged(); });
      const eventSurface = mode === "overview" ? element.parentElement! : canvas;

      function resize() {
        if (!element) return;
        const width = element.clientWidth;
        const height = element.clientHeight - (mode === "single" ? 62 : 0);
        if (!width || !height) return;
        const pixelBudget = constrained ? 650_000 : 1_400_000;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, constrained ? 1.25 : 1.5, Math.sqrt(pixelBudget / (width * height))));
        renderer.setSize(width, height, false);
        // Keep the full landmark visible in wide, shallow story viewports.
        const baseSpan = mode === "overview" && window.innerWidth >= 640 ? 19.2 : mode === "single" && modelSpace < 2 ? (modelSpace === 1 ? 7.1 : 6.7) : 6.2;
        const span = mode === "overview" && window.innerWidth >= 640 ? Math.max(baseSpan, width / height * 5.8) : Math.max(baseSpan, width / height * 5.2);
        if(mode === "overview") element.parentElement?.style.setProperty("--landmark-width", `${Math.min(width,width / span * 15)}px`);
        camera.left = -span / 2;
        camera.right = span / 2;
        camera.top = span / 2 * height / width;
        camera.bottom = -camera.top;
        camera.updateProjectionMatrix();
        renderer.shadowMap.needsUpdate = true;
        resume();
      }
      function roomAt(event: PointerEvent): WorldIndex | null {
        const bounds = canvas.getBoundingClientRect();
        if (event.clientY < bounds.top || event.clientY > bounds.bottom || event.clientX < bounds.left || event.clientX > bounds.right) return null;
        const worldX = ((event.clientX - bounds.left) / bounds.width - .5) * (camera.right - camera.left);
        if(worldX < -7.5 || worldX > 7.5) return null;
        return Math.max(0, Math.min(2, Math.floor((worldX + 7.5) / 5))) as WorldIndex;
      }
      function selectRoom(event: PointerEvent) {
        if (mode !== "overview" || window.innerWidth < 640) return;
        const index = roomAt(event);
        if (index !== null && index !== config.current.space) config.current.onSelect?.(index);
      }
      function move(event: PointerEvent) {
        interactionUntil = performance.now() + 350;
        if (event.pointerType !== "mouse" || window.innerWidth < 640 || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        if (mode === "single") {
          if (modelSpace > 1 || pointerStart) return;
          const bounds = canvas.getBoundingClientRect();
          hoveredRoom = 0;
          mouseX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
          mouseY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
          return;
        }
        hoveredRoom = roomAt(event);
        if (hoveredRoom === null) { leave(); return; }
        const bounds = canvas.getBoundingClientRect();
        const roomWidth = bounds.width / (camera.right - camera.left) * 5;
        const roomCenter = bounds.width / 2 + (hoveredRoom - 1) * roomWidth;
        // Each room responds across its own width, including the middle room.
        mouseX = Math.max(-1, Math.min(1, (event.clientX - bounds.left - roomCenter) / roomWidth * 2));
        mouseY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        if(hoveredRoom !== config.current.space) config.current.onPreview?.(hoveredRoom);
      }
      function leave() { mouseX = 0; mouseY = 0; hoveredRoom = null; if(mode === "overview") config.current.onPreview?.(null); }
      function down(event: PointerEvent) { pointerStart = { x: event.clientX, y: event.clientY }; if (mode === "single") leave(); }
      function up(event: PointerEvent) {
        if (!pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) { pointerStart = null; return; }
        pointerStart = null;
        selectRoom(event);
      }
      function cancelledPointer() { pointerStart = null; }
      function lostContext(event: Event) { event.preventDefault(); cancelled = true; dispose?.(); setStatus("fallback"); }
      motionMedia.addEventListener("change", resume);
      controls?.addEventListener("change", resume);
      canvas.addEventListener("webglcontextlost", lostContext);
      eventSurface.addEventListener("pointermove", move);
      eventSurface.addEventListener("pointerleave", leave);
      eventSurface.addEventListener("pointerdown", down);
      eventSurface.addEventListener("pointerup", up);
      eventSurface.addEventListener("pointercancel", cancelledPointer);
      sizeObserver.observe(element);
      visibilityObserver.observe(element);
      document.addEventListener("visibilitychange", visibilityChanged);
      action.current = name => {
        interactionUntil = performance.now() + 650;
        if (!controls) return;
        if (name === "reset") { camera.position.copy(homePosition); controls.target.copy(target);  }
        else { const offset = camera.position.clone().sub(controls.target); offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), name === "left" ? -.35 : .35); camera.position.copy(controls.target).add(offset); }
        controls.update();
      };
      dispose = () => {
        cancelAnimationFrame(frame);
        clearTimeout(loadTimeout);
        manager.abort();
        downloads.abort();
        invalidate.current = () => {};
        motionMedia.removeEventListener("change", resume);
        controls?.removeEventListener("change", resume);
        sizeObserver.disconnect();
        visibilityObserver.disconnect();
        document.removeEventListener("visibilitychange", visibilityChanged);
        window.removeEventListener("scroll", scrolling);
        eventSurface.removeEventListener("pointermove", move);
        eventSurface.removeEventListener("pointerleave", leave);
        eventSurface.removeEventListener("pointerdown", down);
        eventSurface.removeEventListener("pointerup", up);
        eventSurface.removeEventListener("pointercancel", cancelledPointer);
        canvas.removeEventListener("webglcontextlost", lostContext);
        controls?.dispose?.();
        materials.forEach(mat => mat.dispose());
        textures.forEach(texture => texture.dispose());
        geometries.forEach(geometry => geometry.dispose());
        environmentMap.dispose();
        key.shadow.dispose();
        spotlights.forEach(spot => spot.light.shadow.dispose());
        renderer.dispose();
        canvas.remove();
        action.current = () => {};
      };
      const loadIndices = mode === "overview" ? [0, 1, 2] : [modelSpace];
      // Start optional decorations alongside the rooms; they never gate a usable scene.
      const support = mode === "overview" ? Promise.allSettled([loader.loadAsync("/models/connections.glb"), loader.loadAsync("/models/rocket.glb")]) : null;
      // Download in parallel, but decode one room at a time. Concurrent GLTF
      // parsing used to pile all three geometry/material setup tasks onto input.
      const assets = await Promise.allSettled(loadIndices.map(index =>
        fetch(`/models/${worlds[index]}.glb`, { signal: downloads.signal }).then(response => {
          if (!response.ok) throw new Error("Room asset unavailable");
          return response.arrayBuffer();
        })));
      const retired = new Set<import("three").BufferGeometry>();
      for (const [position, result] of assets.entries()) {
        if (result.status === "rejected") continue;
        await new Promise<void>(resolve => setTimeout(resolve, 0));
        if (cancelled) { dispose?.(); return; }
        let room: Group;
        try { room = (await loader.parseAsync(result.value, "/models/")).scene; }
        catch { continue; }
        // The room moves as a unit. Batch its static parts by material instead of
        // issuing a separate GPU draw for every chair leg, key, plant, and book.
        // Orbital pivots retain their own hierarchy and animation.
        room.updateWorldMatrix(true, true);
        const inverse = room.matrixWorld.clone().invert();
        const batches = new Map<string, { material: MeshStandardMaterial; meshes: Mesh[] }>();
        room.traverse(child => {
          if (!(child as Mesh).isMesh) return;
          let ancestor: Object3D | null = child;
          while (ancestor && ancestor !== room) {
            if (ancestor.name.startsWith("orbit_")) return;
            ancestor = ancestor.parent;
          }
          const mesh = child as Mesh;
          if (Array.isArray(mesh.material) || mesh.morphTargetInfluences || (mesh as import("three").SkinnedMesh).isSkinnedMesh) return;
          const material = mesh.material as MeshStandardMaterial;
          const key = `${material.uuid}:${Object.keys(mesh.geometry.attributes).sort().join(",")}:${Boolean(mesh.geometry.index)}`;
          if (!batches.has(key)) batches.set(key, { material, meshes: [] });
          batches.get(key)!.meshes.push(mesh);
        });
        for (const batch of batches.values()) {
          if (batch.meshes.length < 2) continue;
          const copies = batch.meshes.map(mesh => mesh.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld)));
          const combined = mergeGeometries(copies, false);
          copies.forEach(geometry => geometry.dispose());
          if (!combined) continue;
          batch.meshes.forEach(mesh => { retired.add(mesh.geometry); mesh.removeFromParent(); });
          const mesh = new THREE.Mesh(combined, batch.material);
          mesh.name = "room_batch";
          room.add(mesh);
        }
        room.traverse(child => {
          if (child.name.startsWith("orbit_system")) child.visible = mode === "single";
          if (child.name.startsWith("orbit_pivot_")) satellites.push(child as Group);
          if (child.name.startsWith("orbit_icon_") && !(child as Mesh).isMesh) satelliteIcons.push(child);
        });
        const palette: MeshStandardMaterial[] = [];
        const paletteCache = new Map<string, MeshStandardMaterial>();
        room.traverse(child => {
          if (!(child as Mesh).isMesh) return;
          const mesh = child as Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          geometries.add(mesh.geometry);
          const source = mesh.material as MeshStandardMaterial;
          const overlay = mesh.name.startsWith("orbit_icon_");
          const key = `${source.uuid}:${overlay}`;
          let material = paletteCache.get(key);
          if (!material) {
            material = source.clone();
            if (overlay) material.depthTest = false;
            Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); });
            material.userData.originalColor = material.color.clone();
            material.userData.originalEmission = material.emissive.clone();
            material.userData.originalIntensity = material.emissiveIntensity;
            paletteCache.set(key, material); materials.push(material); palette.push(material);
          }
          if (overlay) mesh.renderOrder = 3;
          mesh.material = material;
        });
        // Release source geometry once all instances have been baked into batches.
        geometries.forEach(geometry => retired.delete(geometry));
        retired.forEach(geometry => geometry.dispose()); retired.clear();
        // The spotlight is actual scene illumination, with material response,
        // soft falloff. The shared key light supplies the desktop shadows.
        const spot = new THREE.SpotLight(0xfff1dd, 0, 12, Math.PI / 5.5, .95, 2);
        spot.position.set(-.7, 4.4, 1.5);
        spot.target.position.set(0, .3, 0);
        spot.shadow.mapSize.set(512, 512);
        spot.shadow.normalBias = .04;
        spot.shadow.bias = -.0003;
        spot.shadow.camera.near = .2;
        spot.shadow.camera.far = 12;
        room.add(spot, spot.target);
        spotlights.push({ light: spot, intensity: 0 });
        room.position.x = mode === "overview" ? (position - 1) * 5 : 0;
        rooms.push(room);
        roomMaterials.push(palette);
        scene.add(room);
        // Give input a turn between rooms instead of preparing the entire world
        // in one uninterrupted JavaScript task.
        await new Promise<void>(resolve => setTimeout(resolve, 0));
        if (cancelled) { dispose?.(); return; }
      }
      if (cancelled) { dispose?.(); return; }
      if (rooms.length !== loadIndices.length) { setStatus("fallback"); dispose?.(); return; }
      async function addSupport() {
        const [connectionResult, rocketResult] = await support!;
        clearTimeout(loadTimeout);
        if (cancelled) return;
        const connection = connectionResult.status === "fulfilled" ? connectionResult.value : null;
        if (connection) {
          scene.add(connection.scene);
          connection.scene.updateWorldMatrix(true, true);
          connection.scene.traverse(child => {
            if (!(child as Mesh).isMesh) return;
            const mesh = child as Mesh;
            const material = (mesh.material as MeshStandardMaterial).clone();
            material.transparent = true;
            material.opacity = 0;
            mesh.material = material;
            mesh.castShadow = true;
            geometries.add(mesh.geometry);
            materials.push(material);
            bridgeMaterials.push(material);
            const original = new Float32Array(mesh.geometry.attributes.position.array);
            const weights = new Float32Array(original.length / 3);
            const indices = new Uint8Array(weights.length);
            for (let vertex = 0; vertex < weights.length; vertex++) {
              bridgeVertex.fromArray(original, vertex * 3).applyMatrix4(mesh.matrixWorld);
              const index = bridgeVertex.x < 0 ? 0 : 1;
              indices[vertex] = index;
              weights[vertex] = Math.max(0, Math.min(1, (bridgeVertex.x - (index === 0 ? -3.1 : 1.9)) / 1.2));
            }
            bridges.push({ mesh, original, weights, indices,
              localOffsets: bridgeOffsets.map(pair => pair.map(() => new THREE.Vector3())),
              toLocal: new THREE.Matrix3().setFromMatrix4(mesh.matrixWorld.clone().invert()) });
          });
        }
        if (rocketResult.status === "fulfilled") {
          rocket = rocketResult.value.scene;
          rocketExhaust = rocket.getObjectByName("rocket_exhaust");
          rocket.scale.setScalar(.55);
          rocket.traverse(child => {
            if (!(child as Mesh).isMesh) return;
            const mesh = child as Mesh;
            mesh.castShadow = false;
            geometries.add(mesh.geometry);
            const material = (mesh.material as MeshStandardMaterial).clone();
            mesh.material = material;
            materials.push(material);
          });
          if (cancelled) { dispose?.(); return; }
          scene.add(rocket);
        }
        if (cancelled) { dispose?.(); return; }
        resume();
      }
      resize();
      // Warm the room materials before the canvas fades in. Where supported,
      // Three uses parallel shader compilation instead of a first-frame stall.
      await new Promise<void>(resolve => setTimeout(resolve, 0));
      if (cancelled) { dispose?.(); return; }
      await renderer.compileAsync(scene, camera);
      if (cancelled) { dispose?.(); return; }
      let firstFrame = true;
      function render(time: number) {
        frame = 0;
        if (cancelled || !visible || document.hidden) return;
        if (!motionMedia.matches) frame = requestAnimationFrame(render);
        const cadence = pointerStart || time < interactionUntil ? 16 : 32;
        if (!firstFrame && !motionMedia.matches && time - previousTime < cadence) return;
        // Native sticky scrolling gets priority over ambient WebGL work. Keep the
        // current frame stable during a scroll gesture; resume gently when it rests.
        if (!firstFrame && time < scrollingUntil && !pointerStart && (mode === "single" || emphasizedSpace === config.current.space)) {
          previousTime = time;
          return;
        }
        const elapsed = Math.min((time - previousTime) / 1000, .05);
        previousTime = time;
        // A room arrives as one coherent object, rather than dozens of tiny
        // scale animations. Geometry and materials are already ready to draw.
        if (revealProgress < 1) {
          const bounds = element!.getBoundingClientRect();
          revealProgress = motionMedia.matches ? 1 : Math.max(revealProgress,
            Math.max(0, Math.min(1, (window.innerHeight - bounds.top - 40) / Math.min(bounds.height * .8, window.innerHeight * .55))));
        }
        if (revealProgress > 0) revealTime += elapsed;
        const assemblyProgress = motionMedia.matches || mode === "overview" ? 1 : Math.min(1, revealTime / .65);
        spotlights.forEach((spot, index) => {
          const active = mode === "single" || index === config.current.space;
          const desired = active ? 1 : 0;
          spot.intensity += (desired - spot.intensity) * (motionMedia.matches ? 1 : 1 - Math.exp(-elapsed * 5));
          spot.light.intensity = 52 * spot.intensity;
          // The key light supplies one shared shadow map; spotlights still illuminate.
          spot.light.castShadow = false;
        });
        if (rocket) {
          // Let the complete homepage scene settle before the rocket takes flight.
          const flightReady = motionMedia.matches || revealTime >= .7;
          if (!motionMedia.matches && flightReady) flightTime += elapsed;
          // Fly back and forth along a curved route between cloud islands.
          const cycle = motionMedia.matches ? .22 : (flightTime % 24) / 24;
          const outward = cycle < .5;
          const progress = outward ? cycle * 2 : (1 - cycle) * 2;
          rocket.position.copy(flightPath.getPointAt(progress));
          rocketDirection.copy(flightPath.getTangentAt(progress)).multiplyScalar(outward ? 1 : -1);
          rocket.quaternion.setFromUnitVectors(rocketForward, rocketDirection);
          rocket.visible = flightReady && assemblyProgress > .75;
          if (rocketExhaust) rocketExhaust.scale.set(1 + (motionMedia.matches ? 0 : Math.sin(flightTime * 17) * .12), 1, 1);
        }
        if (mode === "single" && !motionMedia.matches) satellites.forEach(pivot => {
          // Blender exports Z-up as Y-up. The pivot remains inside its tilted orbital plane.
          const duration = Number(pivot.userData.orbit_duration) || 8;
          pivot.rotateY(elapsed * Math.PI * 2 / duration);
        });
        if (mode === "overview") {
          if (emphasizedSpace !== config.current.space) {
            emphasizedSpace = config.current.space;
            roomMaterials.forEach((palette, index) => palette.forEach(material => {
              const selected = index === emphasizedSpace;
              material.color.copy(material.userData.originalColor).multiplyScalar(selected ? 1 : .35);
              material.emissive.copy(material.userData.originalEmission);
              material.emissiveIntensity = material.userData.originalIntensity * (selected ? 1 : .35);
            }));
          }
          const mobile = window.innerWidth < 640;
          const center = mobile ? (config.current.space - 1) * 5 : 0;
          currentCenter += (center - currentCenter) * (motionMedia.matches ? 1 : .15);
          camera.position.x = currentCenter;
          camera.lookAt(currentCenter, .8, 0);
          rooms.forEach((room, index) => {
            const responds = !mobile && !motionMedia.matches && index === hoveredRoom;
            const targets = [
              responds ? -.045 + mouseY * .10 : 0,
              responds ? .06 + mouseX * .30 : 0,
              responds ? -mouseX * .035 : 0,
              responds ? .14 + Math.sin(time * .0028 + index) * .022 : 0,
              responds ? 1.055 : 1,
            ];
            const spring = roomSprings[index];
            const step = Math.min(elapsed, .05);
            targets.forEach((value, axis) => {
              if (motionMedia.matches || mobile) {
                spring.values[axis] = value;
                spring.velocities[axis] = 0;
                return;
              }
              spring.velocities[axis] = (spring.velocities[axis] + (value - spring.values[axis]) * 170 * step) * Math.exp(-15 * step);
              spring.values[axis] += spring.velocities[axis] * step;
            });
            room.rotation.set(spring.values[0], spring.values[1], spring.values[2]);
            room.position.y = spring.values[3] + (motionMedia.matches ? 0 : Math.sin(time * .0011 + index * 1.4) * .025);
            room.scale.setScalar(spring.values[4]);
          });
        }
        if (mode === "single" && modelSpace < 2) {
          const responds = window.innerWidth >= 640 && !motionMedia.matches && hoveredRoom === 0 && !pointerStart;
          const spring = roomSprings[0];
          const targets = [responds ? mouseY * .035 : 0, responds ? mouseX * .065 : 0, 0, responds ? .035 : 0];
          const step = Math.min(elapsed, .05);
          targets.forEach((value, axis) => {
            if (motionMedia.matches) { spring.values[axis] = value; spring.velocities[axis] = 0; return; }
            spring.velocities[axis] = (spring.velocities[axis] + (value - spring.values[axis]) * 170 * step) * Math.exp(-15 * step);
            spring.values[axis] += spring.velocities[axis] * step;
          });
          rooms[0].rotation.set(spring.values[0], spring.values[1], 0);
          rooms[0].position.y = spring.values[3] + (motionMedia.matches ? 0 : Math.sin(time * .0011) * .025);
        }
        if (mode === "single" && modelSpace === 2) rooms[0].position.y = motionMedia.matches ? 0 : Math.sin(time * .0011) * .025;
        if (mode === "overview" && (time - previousBridgeTime > 80 || motionMedia.matches)) {
          previousBridgeTime = time;
          // Native Blender conduits bend between the moving attachment points.
          // Preserve their modeled plugs and paired cable profile while hovering.
          for (let bridge = 0; bridge < 2; bridge++) {
            const start = bridge === 0 ? -3.1 : 1.9;
            const end = start + 1.2;
            for (let side = 0; side < 2; side++) {
              const x = side === 0 ? start : end;
              const roomIndex = bridge + side;
              bridgeOffsets[bridge][side].set(x - (roomIndex - 1) * 5, .22, 1.42);
              rooms[roomIndex].localToWorld(bridgeOffsets[bridge][side]);
              bridgeOffsets[bridge][side].sub(bridgeRest.set(x, .22, 1.42));
            }
          }
          bridges.forEach(bridge => {
            bridge.localOffsets.forEach((pair, index) => pair.forEach((value, side) => value.copy(bridgeOffsets[index][side]).applyMatrix3(bridge.toLocal)));
            const position = bridge.mesh.geometry.attributes.position;
            for (let vertex = 0; vertex < position.count; vertex++) {
              const index = bridge.indices[vertex];
              bridgeDelta.copy(bridge.localOffsets[index][0]).lerp(bridge.localOffsets[index][1], bridge.weights[vertex]);
              position.setXYZ(vertex, bridge.original[vertex * 3] + bridgeDelta.x,
                bridge.original[vertex * 3 + 1] + bridgeDelta.y, bridge.original[vertex * 3 + 2] + bridgeDelta.z);
            }
            position.needsUpdate = true;
          });
          bridgeMaterials.forEach(material => { material.opacity = Math.max(0, Math.min(1, (assemblyProgress - .18) * 3)); });
        }
        if (mode === "single" && assemblyProgress < 1) {
          const entrance = assemblyProgress * assemblyProgress * (3 - 2 * assemblyProgress);
          rooms[0].position.y -= (1 - entrance) * .12;
          rooms[0].scale.setScalar(.98 + .02 * entrance);
        } else if (mode === "single") rooms[0].scale.setScalar(1);
        if (controls) { controls.enableDamping = !motionMedia.matches; controls.update(); }
        satelliteIcons.forEach(icon => {
          if (!icon.parent) return;
          icon.parent.getWorldQuaternion(iconOrientation);
          icon.quaternion.copy(iconOrientation.invert().multiply(camera.quaternion));
        });
        if (renderer.shadowMap.enabled && (firstFrame || (hoveredRoom !== null && time - previousShadowTime > 180))) {
          renderer.shadowMap.needsUpdate = true;
          previousShadowTime = time;
        }
        renderer.render(scene, camera);
        const calls = String(renderer.info.render.calls);
        if (element!.dataset.drawCalls !== calls) element!.dataset.drawCalls = calls;
        if (firstFrame) { firstFrame = false; setStatus("ready"); }
      }
      ready = true;
      resume();
      if (support) void addSupport().catch(() => { clearTimeout(loadTimeout); });
      else clearTimeout(loadTimeout);
    }
    return () => {
      cancelled = true; observer.disconnect();
      if (idleTask !== undefined) window.cancelIdleCallback(idleTask);
      if (deferred !== undefined) clearTimeout(deferred);
      dispose?.();
    };
  }, [mode, modelSpace]);

  return <div ref={host} className={`world-model world-model-${mode}`} data-scene-state={status} style={{"--preview-position":`${space*50}%`} as CSSProperties} data-cursor={mode === "overview" ? "world" : "art"}>
    {status === "fallback" && <div className="world-still" aria-hidden="true" style={{backgroundImage:`url("${media.worldStill}")`,backgroundPosition:mode === "overview" ? "center" : `${space*50}% center`,backgroundSize:mode === "overview" ? "contain" : "300% auto"}}/>}
    <noscript><div className="world-still" aria-hidden="true" style={{backgroundImage:`url("${media.worldStill}")`,backgroundPosition:mode === "overview" ? "center" : `${space*50}% center`,backgroundSize:mode === "overview" ? "contain" : "300% auto"}}/></noscript>
    {status === "loading" && <div className="world-model-placeholder" aria-hidden="true"><span className="world-loading-line" /></div>}
    {status === "fallback" && <div className="world-model-placeholder" aria-hidden="true">
      <p>Room preview unavailable</p>
    </div>}
    {mode === "single" && <div className="world-model-tools">
      <p>Drag to rotate</p>
      <div className="world-rotation-controls" aria-label="Rotate the miniature world">
        <button type="button" onClick={() => action.current("left")} disabled={status !== "ready"} aria-label="Rotate scene left"><Arrow direction="left" /></button>
        <button type="button" onClick={() => action.current("reset")} disabled={status !== "ready"}>Reset view</button>
        <button type="button" onClick={() => action.current("right")} disabled={status !== "ready"} aria-label="Rotate scene right"><Arrow /></button>
      </div>
    </div>}
    <span className="sr-only" role="status">{status === "fallback" ? "3D preview unavailable. Use the page links to explore." : status === "ready" ? "Interactive 3D room ready." : "Loading interactive room."}</span>
  </div>;
}
