import * as THREE from 'three';

/**
 * Creates a detailed 3D procedural model for the International Space Station (ISS)
 */
export function createISSModel(scale = 1.0): THREE.Group {
  const group = new THREE.Group();

  // Module material (white metallic thermal blanket)
  const moduleMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.35,
    metalness: 0.7,
  });

  // Solar array material (photovoltaic blue-gold sheen)
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x1a365d,
    roughness: 0.2,
    metalness: 0.85,
    emissive: 0x0a192f,
    emissiveIntensity: 0.4,
  });

  // Truss beam material
  const trussMat = new THREE.MeshStandardMaterial({
    color: 0x8892b0,
    roughness: 0.6,
    metalness: 0.8,
  });

  // Radiator material (white matte)
  const radiatorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
  });

  // 1. Central Pressurized Modules (Zarya / Unity / Destiny / Zvezda)
  const mainModule = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.2, 16), moduleMat);
  mainModule.rotation.z = Math.PI / 2;
  group.add(mainModule);

  const crossModule = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.4, 16), moduleMat);
  crossModule.position.set(0.3, 0, 0);
  group.add(crossModule);

  const cupola = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), moduleMat);
  cupola.position.set(0.3, 0.6, 0);
  group.add(cupola);

  // 2. Integrated Truss Structure (Long spine: 5.5 units long)
  const truss = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 5.8), trussMat);
  group.add(truss);

  // 3. Solar Array Wings (4 pairs = 8 massive panels)
  const panelWidth = 0.8;
  const panelHeight = 2.2;
  const panelThick = 0.03;

  const arrayPositionsZ = [-2.4, -1.8, 1.8, 2.4];
  arrayPositionsZ.forEach((z) => {
    // Upper wing
    const wingUpper = new THREE.Mesh(new THREE.BoxGeometry(panelWidth, panelHeight, panelThick), solarMat);
    wingUpper.position.set(0, panelHeight / 2 + 0.15, z);
    wingUpper.rotation.x = 0.1;
    group.add(wingUpper);

    // Lower wing
    const wingLower = new THREE.Mesh(new THREE.BoxGeometry(panelWidth, panelHeight, panelThick), solarMat);
    wingLower.position.set(0, -(panelHeight / 2 + 0.15), z);
    wingLower.rotation.x = -0.1;
    group.add(wingLower);
  });

  // 4. Heat Radiator Panels (White fins perpendicular to solar arrays)
  const radiator1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.8), radiatorMat);
  radiator1.position.set(0.6, 0, -0.6);
  group.add(radiator1);

  const radiator2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.8), radiatorMat);
  radiator2.position.set(0.6, 0, 0.6);
  group.add(radiator2);

  group.scale.set(scale * 0.45, scale * 0.45, scale * 0.45);
  return group;
}

/**
 * Creates a detailed 3D procedural model for Voyager 1
 */
export function createVoyagerModel(scale = 1.0): THREE.Group {
  const group = new THREE.Group();

  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xf8f9fa,
    roughness: 0.3,
    metalness: 0.2,
  });

  const busMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Golden foil wrap
    roughness: 0.4,
    metalness: 0.8,
  });

  const boomMat = new THREE.MeshStandardMaterial({
    color: 0x343a40,
    roughness: 0.7,
    metalness: 0.6,
  });

  // 1. High-Gain 3.7m Parabolic Dish Antenna
  const dishGeom = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
  const dish = new THREE.Mesh(dishGeom, dishMat);
  dish.rotation.x = Math.PI;
  group.add(dish);

  // Sub-reflector tripod feed
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), dishMat);
  feed.position.set(0, 0.45, 0);
  group.add(feed);

  // 2. 10-Sided Golden Main Bus Body
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 10), busMat);
  bus.position.set(0, -0.4, 0);
  group.add(bus);

  // 3. Golden Record Plaque (mounted on bus side)
  const record = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 16), busMat);
  record.rotation.z = Math.PI / 2;
  record.position.set(0.62, -0.4, 0);
  group.add(record);

  // 4. RTG Power Boom (extends outwards with cooling fins)
  const rtgBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), boomMat);
  rtgBoom.rotation.z = Math.PI / 3;
  rtgBoom.position.set(-1.0, -0.6, 0);
  group.add(rtgBoom);

  const rtgCanisters = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.8, 8), boomMat);
  rtgCanisters.position.set(-1.8, -1.0, 0);
  group.add(rtgCanisters);

  // 5. Magnetometer Boom (long slender mast)
  const magBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3.2, 6), boomMat);
  magBoom.rotation.x = Math.PI / 3;
  magBoom.position.set(0, -0.6, 1.4);
  group.add(magBoom);

  group.scale.set(scale * 0.5, scale * 0.5, scale * 0.5);
  return group;
}

/**
 * Creates a detailed 3D procedural model for James Webb Space Telescope (JWST)
 */
export function createJWSTModel(scale = 1.0): THREE.Group {
  const group = new THREE.Group();

  // Beryllium Gold Mirror material
  const goldMirrorMat = new THREE.MeshStandardMaterial({
    color: 0xf6c85f,
    roughness: 0.1,
    metalness: 0.95,
  });

  // Sunshield material (silver/purple reflective membrane)
  const sunshieldMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    roughness: 0.3,
    metalness: 0.7,
    side: THREE.DoubleSide,
  });

  const boomMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.6,
  });

  // 1. Kite-Shaped 5-Layer Sunshield Base
  const sunshieldShape = new THREE.Shape();
  sunshieldShape.moveTo(0, 1.8);
  sunshieldShape.lineTo(1.1, 0.3);
  sunshieldShape.lineTo(0.9, -1.5);
  sunshieldShape.lineTo(-0.9, -1.5);
  sunshieldShape.lineTo(-1.1, 0.3);
  sunshieldShape.closePath();

  const sunshieldGeo = new THREE.ShapeGeometry(sunshieldShape);
  const sunshield = new THREE.Mesh(sunshieldGeo, sunshieldMat);
  sunshield.rotation.x = Math.PI / 2;
  sunshield.position.set(0, -0.2, 0);
  group.add(sunshield);

  // 2. Primary Hexagonal Mirror Segment Assembly (6.5m mirror)
  const mirrorCluster = new THREE.Group();
  const hexRadius = 0.22;
  const hexGeom = new THREE.CylinderGeometry(hexRadius, hexRadius, 0.05, 6);

  // Center + 2 concentric rings of hexagons
  const hexPositions: [number, number][] = [
    [0, 0],
    [0, 0.4], [0, -0.4],
    [0.35, 0.2], [-0.35, 0.2],
    [0.35, -0.2], [-0.35, -0.2],
    [0, 0.8], [0, -0.8],
    [0.7, 0.4], [-0.7, 0.4],
    [0.7, -0.4], [-0.7, -0.4],
    [0.35, 0.6], [-0.35, 0.6],
    [0.35, -0.6], [-0.35, -0.6],
    [0.7, 0], [-0.7, 0],
  ];

  hexPositions.forEach(([x, y]) => {
    // Skip absolute center for instrument opening
    if (x === 0 && y === 0) return;
    const hex = new THREE.Mesh(hexGeom, goldMirrorMat);
    hex.rotation.x = Math.PI / 2;
    hex.position.set(x, y + 0.3, 0.15);
    mirrorCluster.add(hex);
  });
  group.add(mirrorCluster);

  // 3. Secondary Mirror Tripod Boom
  const tripod1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), boomMat);
  tripod1.position.set(0.3, 0.4, 0.6);
  tripod1.rotation.x = 0.5;
  tripod1.rotation.z = -0.3;
  group.add(tripod1);

  const tripod2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), boomMat);
  tripod2.position.set(-0.3, 0.4, 0.6);
  tripod2.rotation.x = 0.5;
  tripod2.rotation.z = 0.3;
  group.add(tripod2);

  const secondaryMirror = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12), goldMirrorMat);
  secondaryMirror.position.set(0, 0.6, 0.9);
  group.add(secondaryMirror);

  group.scale.set(scale * 0.55, scale * 0.55, scale * 0.55);
  return group;
}

/**
 * Creates an irregular, perturbed, cratered 3D asteroid geometry (e.g. Apophis, Bennu)
 */
export function createAsteroidGeometry(radius: number): THREE.BufferGeometry {
  const geom = new THREE.IcosahedronGeometry(radius, 4);
  const posAttr = geom.attributes.position;
  const count = posAttr.count;

  for (let i = 0; i < count; i++) {
    let x = posAttr.getX(i);
    let y = posAttr.getY(i);
    let z = posAttr.getZ(i);

    // Multi-frequency spherical harmonic displacement
    const len = Math.sqrt(x * x + y * y + z * z);
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    // Asymmetry and craters
    const noise =
      Math.sin(nx * 4 + ny * 3) * 0.12 +
      Math.cos(ny * 6 + nz * 4) * 0.08 +
      Math.sin(nx * 10 + nz * 9) * 0.04;

    // Slight peanut elongation along x
    const elongation = 1.0 + 0.25 * (nx * nx);
    const scale = (1.0 + noise) * elongation;

    posAttr.setXYZ(i, x * scale, y * scale, z * scale);
  }

  geom.computeVertexNormals();
  return geom;
}
