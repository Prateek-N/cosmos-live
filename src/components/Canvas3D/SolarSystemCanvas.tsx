import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CelestialBody, LayerVisibility, ScaleMode } from '../../types/solar';
import { CELESTIAL_BODIES } from '../../data/celestialBodies';
import {
  generateOrbitPoints,
  getDisplayRadius,
  getHeliocentricPositionAU,
  getParentRelativePositionAU,
  toSceneCoordinates,
} from '../../services/ephemeris';
import {
  getCelestialBodyTexture,
  getSaturnRingTexture,
  getMilkyWayTexture,
} from './textures';
import {
  createISSModel,
  createVoyagerModel,
  createJWSTModel,
  createAsteroidGeometry,
} from './spacecraftModels';
import { EARTH_SATELLITES } from '../../data/earthSatellites';

interface SolarSystemCanvasProps {
  selectedBodyId: string | null;
  onSelectBody: (body: CelestialBody | null) => void;
  hoveredBodyId: string | null;
  onHoverBody: (body: CelestialBody | null) => void;
  scaleMode: ScaleMode;
  simDate: Date;
  layers: LayerVisibility;
  cameraLock: boolean;
  onResetViewRef?: (resetFn: () => void) => void;
}

interface BodyMeshBundle {
  body: CelestialBody;
  group: THREE.Group;
  mesh: THREE.Mesh;
  glowMesh?: THREE.Mesh;
  cloudMesh?: THREE.Mesh;
  orbitLine?: THREE.Line;
  orbitGroup?: THREE.Group;
  currentWorldPos: THREE.Vector3;
}

export const SolarSystemCanvas: React.FC<SolarSystemCanvasProps> = ({
  selectedBodyId,
  onSelectBody,
  onHoverBody,
  scaleMode,
  simDate,
  layers,
  cameraLock,
  onResetViewRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References for mutable Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bodyBundlesRef = useRef<Map<string, BodyMeshBundle>>(new Map());
  const asteroidCloudRef = useRef<THREE.Points | null>(null);
  const skyDomeRef = useRef<THREE.Mesh | null>(null);

  // Camera animation / interaction state
  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 75, 130));
  const cameraLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSpherical = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 150,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  // Keep latest props accessible in animation loop without tearing
  const propsRef = useRef({
    selectedBodyId,
    scaleMode,
    simDate,
    layers,
    cameraLock,
  });
  propsRef.current = { selectedBodyId, scaleMode, simDate, layers, cameraLock };

  // Helper to trigger camera reset
  const resetCamera = () => {
    cameraSpherical.current = { radius: 160, theta: Math.PI / 4, phi: Math.PI / 3 };
    cameraLookAt.current.set(0, 0, 0);
  };

  useEffect(() => {
    if (onResetViewRef) {
      onResetViewRef(resetCamera);
    }
  }, [onResetViewRef]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x030712); // Deep cosmic void

    // Camera with Logarithmic Depth Buffer capability
    const width = container.clientWidth || window.innerWidth || 1920;
    const height = container.clientHeight || window.innerHeight || 1080;
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      50000
    );
    cameraRef.current = camera;
    camera.position.set(0, 90, 160);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // --- 2. LIGHTING ---
    // --- 2. LIGHTING ---
    // Ambient light - bright and neutral so all planets are clearly visible from any camera angle
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.6);
    scene.add(ambientLight);

    // Sun point light at origin with zero decay to illuminate the whole solar system
    const sunLight = new THREE.PointLight(0xffffff, 5.0, 0, 0);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Directional light for 3D depth and shadow contouring
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(80, 120, 80);
    scene.add(dirLight);

    // --- 3. BACKGROUND: MILKY WAY SKYBOX & MULTI-SPECTRAL STARFIELD ---
    const milkyWayTexture = getMilkyWayTexture();
    const skyGeo = new THREE.SphereGeometry(3500, 48, 32);
    const skyMat = new THREE.MeshBasicMaterial({
      map: milkyWayTexture,
      side: THREE.BackSide,
      transparent: false,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);
    skyDomeRef.current = skyDome;

    const starCount = 6000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x90caf9),
      new THREE.Color(0xffe082),
      new THREE.Color(0xf48fb1),
      new THREE.Color(0x80d8ff),
    ];

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const cosVal = Math.max(-1, Math.min(1, 2.0 * v - 1.0));
      const phi = Math.acos(cosVal);
      const r = 700 + Math.random() * 350; // In close viewing range

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      starPositions[i * 3] = isNaN(x) ? 0 : x;
      starPositions[i * 3 + 1] = isNaN(y) ? 0 : y;
      starPositions[i * 3 + 2] = isNaN(z) ? 0 : z;

      const col = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // Smooth circular particle texture to eliminate square pixel glitches
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 64;
      pCanvas.height = 64;
      const pCtx = pCanvas.getContext('2d')!;
      pCtx.clearRect(0, 0, 64, 64);
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(240, 245, 255, 0.85)');
      grad.addColorStop(0.65, 'rgba(180, 210, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(pCanvas);
    };
    const circleParticleTex = createParticleTexture();

    const starMat = new THREE.PointsMaterial({
      map: circleParticleTex,
      size: 1.8,
      sizeAttenuation: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      alphaTest: 0.02,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // --- 4. ASTEROID BELT PARTICLES (SMOOTH REALISTIC DUST & ROCK PARTICLES) ---
    const asteroidCount = 3500;
    const asteroidGeo = new THREE.BufferGeometry();
    const asteroidPos = new Float32Array(asteroidCount * 3);
    const asteroidInitialAngles = new Float32Array(asteroidCount);
    const asteroidRadii = new Float32Array(asteroidCount);

    for (let i = 0; i < asteroidCount; i++) {
      // Main belt between 2.2 and 3.2 AU
      const rAU = 2.1 + Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.15; // Vertical dispersion

      asteroidRadii[i] = rAU;
      asteroidInitialAngles[i] = angle;

      const p = toSceneCoordinates(
        { x: rAU * Math.cos(angle), y: rAU * Math.sin(angle), z: height },
        propsRef.current.scaleMode
      );
      asteroidPos[i * 3] = p.x;
      asteroidPos[i * 3 + 1] = p.y;
      asteroidPos[i * 3 + 2] = p.z;
    }

    asteroidGeo.setAttribute('position', new THREE.BufferAttribute(asteroidPos, 3));
    const asteroidMat = new THREE.PointsMaterial({
      map: circleParticleTex,
      color: 0xd4d4d8,
      size: 0.45,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5,
      alphaTest: 0.02,
      depthWrite: false,
    });
    const asteroidCloud = new THREE.Points(asteroidGeo, asteroidMat);
    scene.add(asteroidCloud);
    asteroidCloudRef.current = asteroidCloud;

    // --- 5. CELESTIAL BODIES CREATION WITH REAL PHOTOGRAPHIC TEXTURES & 3D MODELS ---
    const bundles = new Map<string, BodyMeshBundle>();

    CELESTIAL_BODIES.forEach((body) => {
      const group = new THREE.Group();
      scene.add(group);

      const radius = getDisplayRadius(body, propsRef.current.scaleMode);
      // Load official NASA / Solar System Scope 2K photographic texture
      const texture = getCelestialBodyTexture(body.id, body.textureType, body.color, body.secondaryColor);

      let mesh: THREE.Mesh;
      let cloudMesh: THREE.Mesh | undefined;

      // SPECIFIC 3D MODELS FOR SPACECRAFT & ASTEROIDS
      if (body.id === 'iss') {
        const issModel = createISSModel(0.12);
        group.add(issModel);
        // Small raycasting hit sphere so it never intercepts clicks on Earth
        const hitGeom = new THREE.SphereGeometry(0.18, 16, 16);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        mesh = new THREE.Mesh(hitGeom, hitMat);
      } else if (body.id === 'voyager1') {
        const voyagerModel = createVoyagerModel(radius * 2.2);
        group.add(voyagerModel);
        const hitGeom = new THREE.SphereGeometry(radius * 1.6, 16, 16);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        mesh = new THREE.Mesh(hitGeom, hitMat);
      } else if (body.id === 'jwst') {
        const jwstModel = createJWSTModel(radius * 2.2);
        group.add(jwstModel);
        const hitGeom = new THREE.SphereGeometry(radius * 1.6, 16, 16);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        mesh = new THREE.Mesh(hitGeom, hitMat);
      } else if (body.type === 'asteroid' || body.type === 'comet') {
        // Deformed, irregular 3D tumbling rock geometry
        const geom = createAsteroidGeometry(radius);
        const mat = new THREE.MeshStandardMaterial({
          map: texture,
          color: new THREE.Color(body.color),
          roughness: 0.9,
          metalness: 0.1,
        });
        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);
      } else {
        // High-resolution sphere with photographic texture
        const geom = new THREE.SphereGeometry(radius, 64, 64);
        let mat: THREE.Material;
        if (body.type === 'star') {
          mat = new THREE.MeshBasicMaterial({
            map: texture,
            color: new THREE.Color(0xffffff),
          });
        } else {
          mat = new THREE.MeshStandardMaterial({
            map: texture,
            color: new THREE.Color(0xffffff),
            roughness: body.id === 'moon' || body.id === 'mercury' ? 0.95 : 0.4,
            metalness: 0.05,
          });
        }
        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);
      }

      mesh.name = body.id;
      mesh.userData = { bodyId: body.id };

      // Axial tilt
      if (body.physical.axialTiltDeg) {
        mesh.rotation.z = (body.physical.axialTiltDeg * Math.PI) / 180;
      }

      // EARTH: SATELLITE FLEET ORBITS & BEACONS (SUBTLE IN MAIN SOLAR SYSTEM)
      if (body.id === 'earth') {
        const satGroup = new THREE.Group();
        satGroup.name = 'earthSatellites';
        satGroup.visible = false; // Activated only when Earth is selected / inspected

        EARTH_SATELLITES.forEach((sat, sIdx) => {
          let orbR = radius * 1.25;
          let col = 0x38bdf8; // sky cyan
          if (sat.category === 'observatory') {
            orbR = radius * 1.45;
            col = 0xfbbf24; // gold
          } else if (sat.category === 'earth_observation') {
            orbR = radius * 1.6;
            col = 0x34d399; // emerald
          } else if (sat.category === 'navigation') {
            orbR = radius * 2.3; // MEO
            col = 0x818cf8; // indigo
          } else if (sat.category === 'weather') {
            orbR = radius * 3.4; // GEO
            col = 0x38bdf8; // sky
          } else if (sat.category === 'communications') {
            orbR = radius * 1.35;
            col = 0xc084fc; // purple
          }

          // Orbit circle line with subtle, realistic opacity
          const circleCurve = new THREE.EllipseCurve(0, 0, orbR, orbR, 0, 2 * Math.PI, false, 0);
          const circlePts = circleCurve.getPoints(48);
          const orbGeo = new THREE.BufferGeometry().setFromPoints(
            circlePts.map((p) => new THREE.Vector3(p.x, 0, p.y))
          );
          const orbMat = new THREE.LineBasicMaterial({
            color: col,
            transparent: true,
            opacity: 0.12,
          });
          const orbLine = new THREE.Line(orbGeo, orbMat);
          orbLine.rotation.x = (sat.orbit.inclinationDeg * Math.PI) / 180;
          orbLine.rotation.y = sIdx * 0.45;
          satGroup.add(orbLine);

          // Sleek pin-point satellite beacon
          const beaconGeo = new THREE.SphereGeometry(radius * 0.015, 8, 8);
          const beaconMat = new THREE.MeshBasicMaterial({ color: col });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          const angle = sIdx * 1.2;
          beacon.position.set(
            orbR * Math.cos(angle),
            orbR * Math.sin(angle) * Math.sin((sat.orbit.inclinationDeg * Math.PI) / 180),
            orbR * Math.sin(angle) * Math.cos((sat.orbit.inclinationDeg * Math.PI) / 180)
          );
          satGroup.add(beacon);
        });

        group.add(satGroup);
      }

      // ATMOSPHERE GLOW & CORONA
      let glowMesh: THREE.Mesh | undefined;
      if (body.id === 'earth') {
        const glowRadius = radius * 1.025;
        const glowGeom = new THREE.SphereGeometry(glowRadius, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0x38bdf8),
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
        });
        glowMesh = new THREE.Mesh(glowGeom, glowMat);
        group.add(glowMesh);
      } else if (body.type === 'star' || body.hasAtmosphere) {
        const glowRadius = radius * (body.type === 'star' ? 1.25 : 1.1);
        const glowGeom = new THREE.SphereGeometry(glowRadius, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(body.glowColor || body.color),
          transparent: true,
          opacity: body.type === 'star' ? 0.35 : 0.2,
          side: THREE.BackSide,
        });
        glowMesh = new THREE.Mesh(glowGeom, glowMat);
        group.add(glowMesh);
      }

      // SATURN: REAL RING SYSTEM WITH RADIAL UV MAPPING & CASSINI DIVISION
      if (body.hasRings) {
        const ringInner = radius * 1.35;
        const ringOuter = radius * 2.65;
        const ringGeom = new THREE.RingGeometry(ringInner, ringOuter, 64);
        
        // Correct radial UV coordinates for ring texture
        const pos = ringGeom.attributes.position;
        const uvs = ringGeom.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          const dist = Math.sqrt(vx * vx + vy * vy);
          const u = (dist - ringInner) / (ringOuter - ringInner);
          uvs.setXY(i, u, 0.5);
        }
        uvs.needsUpdate = true;

        const ringTex = getSaturnRingTexture();
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
          roughness: 0.45,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        group.add(ringMesh);
      }

      // Orbit line
      let orbitLine: THREE.Line | undefined;
      let orbitGroup: THREE.Group | undefined;
      if (body.orbit.semiMajorAxisAU > 0 && body.parentId === 'sun') {
        const pts = generateOrbitPoints(body, 140);
        const linePts = pts
          .map((p) => {
            const sc = toSceneCoordinates(p, propsRef.current.scaleMode);
            if (!isFinite(sc.x) || !isFinite(sc.y) || !isFinite(sc.z)) return null;
            return new THREE.Vector3(sc.x, sc.y, sc.z);
          })
          .filter((p): p is THREE.Vector3 => p !== null);

        if (linePts.length > 2) {
          const orbitGeo = new THREE.BufferGeometry().setFromPoints(linePts);
          const orbitMat = new THREE.LineBasicMaterial({
            color: new THREE.Color(body.color),
            transparent: true,
            opacity: 0.5,
          });
          orbitLine = new THREE.Line(orbitGeo, orbitMat);
          orbitGroup = new THREE.Group();
          orbitGroup.add(orbitLine);
          scene.add(orbitGroup);
        }
      } else if (body.parentId && body.parentId !== 'sun' && body.type === 'moon') {
        // Moon orbit circle around its parent planet
        const parent = CELESTIAL_BODIES.find((b) => b.id === body.parentId);
        const parentR = parent ? getDisplayRadius(parent, propsRef.current.scaleMode) : 2.0;
        let visualRadius = 6.1;
        if (body.id === 'moon') visualRadius = parentR * 3.6;
        else if (body.id === 'europa') visualRadius = parentR + 3.2;
        else if (body.id === 'titan') visualRadius = parentR * 2.8 + 2.5;

        const incRad = ((body.orbit.inclinationDeg || 5.14) * Math.PI) / 180;
        const pts: THREE.Vector3[] = [];
        const numPts = 72;
        for (let i = 0; i <= numPts; i++) {
          const theta = (i / numPts) * 2 * Math.PI;
          const x = visualRadius * Math.cos(theta);
          const z = visualRadius * Math.sin(theta);
          const y = z * Math.sin(incRad) * 0.4;
          pts.push(new THREE.Vector3(x, y, z * Math.cos(incRad)));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const orbitMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(body.color),
          transparent: true,
          opacity: 0.35,
        });
        orbitLine = new THREE.Line(orbitGeo, orbitMat);
        orbitGroup = new THREE.Group();
        orbitGroup.add(orbitLine);
        scene.add(orbitGroup);
      }

      bundles.set(body.id, {
        body,
        group,
        mesh,
        glowMesh,
        cloudMesh,
        orbitLine,
        orbitGroup,
        currentWorldPos: new THREE.Vector3(),
      });
    });

    bodyBundlesRef.current = bundles;

    // --- 6. RAYCASTING & INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;

        cameraSpherical.current.theta -= deltaX * 0.007;
        cameraSpherical.current.phi -= deltaY * 0.007;

        // Clamp phi to prevent flip
        cameraSpherical.current.phi = Math.max(0.05, Math.min(Math.PI - 0.05, cameraSpherical.current.phi));

        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      } else {
        // Hover detection
        raycaster.setFromCamera(mouse, camera);
        const meshes: THREE.Mesh[] = [];
        bundles.forEach((b) => meshes.push(b.mesh));
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
          const hitId = intersects[0].object.userData.bodyId;
          const found = CELESTIAL_BODIES.find((b) => b.id === hitId) || null;
          onHoverBody(found);
          container.style.cursor = 'pointer';
        } else {
          onHoverBody(null);
          container.style.cursor = 'grab';
        }
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (isDragging.current) {
        isDragging.current = false;
      }

      // Check click selection if not dragged
      const dx = Math.abs(e.clientX - previousMousePosition.current.x);
      const dy = Math.abs(e.clientY - previousMousePosition.current.y);
      if (dx < 4 && dy < 4) {
        raycaster.setFromCamera(mouse, camera);
        const meshes: THREE.Mesh[] = [];
        bundles.forEach((b) => meshes.push(b.mesh));
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
          const hitId = intersects[0].object.userData.bodyId;
          const found = CELESTIAL_BODIES.find((b) => b.id === hitId) || null;
          onSelectBody(found);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1 + Math.abs(e.deltaY) * 0.0015;
      if (e.deltaY > 0) {
        cameraSpherical.current.radius = Math.min(2200, cameraSpherical.current.radius * zoomFactor);
      } else {
        cameraSpherical.current.radius = Math.max(3.5, cameraSpherical.current.radius / zoomFactor);
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth || 1920;
      const h = container.clientHeight || window.innerHeight || 1080;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- 7. ANIMATION RENDER LOOP ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const rawDelta = clock.getDelta();
      const delta = Math.min(Math.max(rawDelta, 0.0001), 0.05); // Strictly clamp to 50ms max
      const lerpAlpha = Math.min(1.0, Math.max(0.01, delta * 4.0)); // Strictly between 0.01 and 1.0
      const { selectedBodyId, scaleMode, simDate, layers, cameraLock } = propsRef.current;

      // Update positions of bodies
      let selectedTargetWorldPos: THREE.Vector3 | null = null;

      bundles.forEach((bundle) => {
        const { body, group, mesh, glowMesh, orbitLine } = bundle;

        // Visibility toggles
        if (body.type === 'moon') group.visible = layers.moons;
        else if (body.type === 'asteroid' || body.type === 'comet') group.visible = layers.asteroids;
        else if (body.type === 'spacecraft') group.visible = layers.spacecraft;
        else group.visible = true;

        if (orbitLine) {
          orbitLine.visible = layers.orbits && group.visible;
          if (bundle.orbitGroup && body.parentId && body.parentId !== 'sun') {
            const parentBundle = bundles.get(body.parentId);
            if (parentBundle) {
              bundle.orbitGroup.position.copy(parentBundle.currentWorldPos);
            }
          }
        }
        if (glowMesh) {
          glowMesh.visible = layers.atmosphereGlow;
        }

        // Ephemeris positioning
        const helioAU = getHeliocentricPositionAU(body, simDate);
        let scenePos = toSceneCoordinates(helioAU, scaleMode);

        // Moons / ISS parent-relative offset
        if (body.parentId && body.parentId !== 'sun') {
          const parentBundle = bundles.get(body.parentId);
          if (parentBundle) {
            const parentPos = parentBundle.currentWorldPos;
            if (body.id === 'iss') {
              // Real smooth orbital propagation outside Earth's atmosphere
              const earthR = getDisplayRadius(parentBundle.body, scaleMode);
              const issOrbitR = earthR * 1.35;
              const simSec = simDate.getTime() / 1000;
              const issAngle = (simSec / (92.9 * 60)) * 2 * Math.PI;
              const incRad = (51.6 * Math.PI) / 180;
              scenePos = {
                x: parentPos.x + issOrbitR * Math.cos(issAngle),
                y: parentPos.y + issOrbitR * Math.sin(issAngle) * Math.sin(incRad),
                z: parentPos.z + issOrbitR * Math.sin(issAngle) * Math.cos(incRad),
              };
            } else {
              const relAU = getParentRelativePositionAU(body, simDate);
              const parentR = getDisplayRadius(parentBundle.body, scaleMode);
              const moonR = getDisplayRadius(body, scaleMode);

              let visualRadius = 6.1;
              if (scaleMode === 'explorer') {
                if (body.id === 'moon') {
                  visualRadius = parentR * 3.6; // ~6.1 units from Earth, clearly visible outside satellites
                } else if (body.id === 'europa') {
                  visualRadius = parentR + 3.2; // ~7.0 units from Jupiter
                } else if (body.id === 'titan') {
                  visualRadius = parentR * 2.8 + 2.5; // ~11.5 units from Saturn, outside rings
                } else {
                  visualRadius = parentR + 3.0;
                }
              } else {
                // Realistic mode
                const rawDist = Math.sqrt(relAU.x * relAU.x + relAU.y * relAU.y + relAU.z * relAU.z) * 60;
                visualRadius = Math.max(parentR + moonR + 0.15, rawDist);
              }

              const relDist = Math.sqrt(relAU.x * relAU.x + relAU.y * relAU.y + relAU.z * relAU.z);
              const normX = relDist > 1e-7 ? relAU.x / relDist : 1;
              const normY = relDist > 1e-7 ? relAU.y / relDist : 0;
              const normZ = relDist > 1e-7 ? relAU.z / relDist : 0;

              // In Three.js: X is horizontal, Y is vertical, Z is depth
              const localX = normX * visualRadius;
              const localY = normZ * visualRadius * 0.4;
              const localZ = normY * visualRadius;

              scenePos = {
                x: parentPos.x + localX,
                y: parentPos.y + localY,
                z: parentPos.z + localZ,
              };
            }
          }
        }

        group.position.set(scenePos.x, scenePos.y, scenePos.z);
        bundle.currentWorldPos.set(scenePos.x, scenePos.y, scenePos.z);

        // Axial spin rotation
        const rotSpeed = body.physical.rotationPeriodHours
          ? (delta * 0.8) / Math.abs(body.physical.rotationPeriodHours / 24)
          : delta * 0.1;
        mesh.rotation.y += rotSpeed;
        if (bundle.cloudMesh) {
          bundle.cloudMesh.rotation.y += rotSpeed * 1.25;
        }

        // Animate Earth satellite fleet
        if (body.id === 'earth') {
          const satGrp = group.getObjectByName('earthSatellites');
          if (satGrp) {
            satGrp.rotation.y += delta * 0.35;
            satGrp.visible = layers.spacecraft && selectedBodyId === 'earth';
          }
        }

        if (body.id === selectedBodyId) {
          selectedTargetWorldPos = bundle.currentWorldPos;
        }
      });

      // Slow cosmic rotation for Milky Way skybox dome
      if (skyDomeRef.current) {
        skyDomeRef.current.rotation.y += delta * 0.0005;
      }

      // Update Asteroid cloud animation
      if (asteroidCloudRef.current && layers.asteroids) {
        asteroidCloudRef.current.visible = true;
        asteroidCloudRef.current.rotation.y += delta * 0.015;
      } else if (asteroidCloudRef.current) {
        asteroidCloudRef.current.visible = false;
      }

      // Smooth camera interpolation
      if (selectedTargetWorldPos && cameraLock) {
        // Revolve / Lock onto selected body
        cameraLookAt.current.lerp(selectedTargetWorldPos, lerpAlpha);
      } else if (selectedTargetWorldPos && !isDragging.current) {
        // Fly-to smooth tracking
        cameraLookAt.current.lerp(selectedTargetWorldPos, lerpAlpha);
      } else if (!selectedBodyId && !isDragging.current) {
        // Return lookAt to center if no selection
        cameraLookAt.current.lerp(new THREE.Vector3(0, 0, 0), lerpAlpha);
      }

      // Safeguard against NaN / non-finite camera states
      if (!isFinite(cameraLookAt.current.x) || isNaN(cameraLookAt.current.x)) {
        cameraLookAt.current.set(0, 0, 0);
      }
      if (!isFinite(cameraSpherical.current.radius) || isNaN(cameraSpherical.current.radius) || cameraSpherical.current.radius < 5) {
        cameraSpherical.current.radius = 160;
      }

      // Calculate camera position from spherical coordinates relative to lookAt target
      const s = cameraSpherical.current;
      const camX = cameraLookAt.current.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      const camY = cameraLookAt.current.y + s.radius * Math.cos(s.phi);
      const camZ = cameraLookAt.current.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta);

      if (isFinite(camX) && isFinite(camY) && isFinite(camZ)) {
        cameraTargetPos.current.set(camX, camY, camZ);
        camera.position.lerp(cameraTargetPos.current, lerpAlpha);
        camera.lookAt(cameraLookAt.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // When selected body changes, adjust camera distance comfortably
  useEffect(() => {
    if (selectedBodyId) {
      const bundle = bodyBundlesRef.current.get(selectedBodyId);
      if (bundle) {
        const radius = getDisplayRadius(bundle.body, scaleMode);
        // Set camera radius nicely scaled to body size
        const targetRadius = Math.max(radius * 4.2, 5.0);
        cameraSpherical.current.radius = Math.min(cameraSpherical.current.radius, targetRadius + 15);
      }
    }
  }, [selectedBodyId, scaleMode]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950"
      style={{ touchAction: 'none' }}
    />
  );
};
