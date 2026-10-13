import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// Mapping of celestial body IDs to high-resolution 2K photographic texture files
const TEXTURE_PATH_MAP: Record<string, string> = {
  sun: '/textures/2k_sun.jpg',
  mercury: '/textures/2k_mercury.jpg',
  venus: '/textures/2k_venus_atmosphere.jpg',
  earth: '/textures/2k_earth_daymap.jpg',
  moon: '/textures/2k_moon.jpg',
  mars: '/textures/2k_mars.jpg',
  jupiter: '/textures/2k_jupiter.jpg',
  saturn: '/textures/2k_saturn.jpg',
  uranus: '/textures/2k_uranus.jpg',
  neptune: '/textures/2k_neptune.jpg',
  ceres: '/textures/2k_ceres_fictional.jpg',
  makemake: '/textures/2k_makemake_fictional.jpg',
  haumea: '/textures/2k_haumea_fictional.jpg',
  eris: '/textures/2k_eris_fictional.jpg',
};

const textureCache = new Map<string, THREE.Texture>();

/**
 * Loads high-resolution 2K photographic textures for real solar system bodies,
 * with graceful fallback to high-quality procedural canvas textures if needed.
 */
export function getCelestialBodyTexture(
  bodyId: string,
  type: string,
  baseColorHex: string,
  secondaryColorHex?: string
): THREE.Texture {
  if (textureCache.has(bodyId)) {
    return textureCache.get(bodyId)!;
  }

  const textureUrl = TEXTURE_PATH_MAP[bodyId];
  if (textureUrl) {
    const tex = textureLoader.load(
      textureUrl,
      (loadedTex) => {
        loadedTex.wrapS = THREE.RepeatWrapping;
        loadedTex.wrapT = THREE.ClampToEdgeWrapping;
        loadedTex.generateMipmaps = true;
        loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTex.needsUpdate = true;
      },
      undefined,
      () => {
        // Fallback to procedural texture on error
        const fallback = createProceduralCanvasTexture(type, baseColorHex, secondaryColorHex);
        (tex as any).image = fallback.image;
        tex.needsUpdate = true;
      }
    );
    textureCache.set(bodyId, tex);
    return tex;
  }

  // If no photographic map is configured (e.g. small asteroids or custom bodies), use procedural
  const procTex = createProceduralCanvasTexture(type, baseColorHex, secondaryColorHex);
  textureCache.set(bodyId, procTex);
  return procTex;
}

/**
 * Load Earth clouds texture with transparency
 */
export function getEarthCloudsTexture(): THREE.Texture {
  if (textureCache.has('earth_clouds')) {
    return textureCache.get('earth_clouds')!;
  }
  const tex = textureLoader.load('/textures/2k_earth_clouds.jpg');
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('earth_clouds', tex);
  return tex;
}

/**
 * Load NASA Black Marble Earth Night Lights texture
 */
export function getEarthNightTexture(): THREE.Texture {
  if (textureCache.has('earth_night')) {
    return textureCache.get('earth_night')!;
  }
  const tex = textureLoader.load('/textures/2k_earth_nightmap.jpg');
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('earth_night', tex);
  return tex;
}

/**
 * Creates high-fidelity Day/Night Earth Shader Material
 * Sunlit hemisphere shows NASA daytime color, night hemisphere illuminates
 * golden webs of city lights with twilight transition and atmospheric rim.
 */
export function createEarthDayNightMaterial(
  dayTex: THREE.Texture,
  nightTex: THREE.Texture,
  sunDirection: THREE.Vector3 = new THREE.Vector3(1, 0, 0)
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDayMap: { value: dayTex },
      uNightMap: { value: nightTex },
      uSunDirection: { value: sunDirection.clone().normalize() },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uDayMap;
      uniform sampler2D uNightMap;
      uniform vec3 uSunDirection;

      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 dayColor = texture2D(uDayMap, vUv).rgb;
        vec3 nightColor = texture2D(uNightMap, vUv).rgb;

        // Compute sun angle in world space
        vec3 norm = normalize(vWorldNormal);
        vec3 lightDir = normalize(uSunDirection);
        float dProd = dot(norm, lightDir);

        // Smooth day/night blend over terminator twilight zone
        float dayFactor = smoothstep(-0.12, 0.20, dProd);
        float nightFactor = 1.0 - dayFactor;

        // Golden city night lights glow on dark hemisphere
        vec3 finalNight = nightColor * nightFactor * 2.5;
        // Crisp, rich day side color with natural ambient light
        vec3 finalDay = dayColor * max(dayFactor, 0.05);

        vec3 color = finalDay + finalNight;

        // Atmospheric Rayleigh blue edge scattering on sunlit limb
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = 1.0 - max(dot(norm, viewDir), 0.0);
        float sunFacingRim = max(dot(viewDir, lightDir), 0.0) * 0.5 + 0.5;
        color += vec3(0.15, 0.45, 0.85) * pow(rim, 3.5) * dayFactor * sunFacingRim * 0.65;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/**
 * Load real Saturn ring texture with alpha channel
 */
export function getSaturnRingTexture(): THREE.Texture {
  if (textureCache.has('saturn_ring')) {
    return textureCache.get('saturn_ring')!;
  }
  const tex = textureLoader.load('/textures/2k_saturn_ring_alpha.png');
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('saturn_ring', tex);
  return tex;
}

/**
 * Load high-resolution 360 Milky Way starfield skybox texture
 */
export function getMilkyWayTexture(): THREE.Texture {
  if (textureCache.has('milky_way')) {
    return textureCache.get('milky_way')!;
  }
  const tex = textureLoader.load('/textures/2k_stars_milky_way.jpg');
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('milky_way', tex);
  return tex;
}

/**
 * High-detail procedural canvas texture generator (used as fallback or for small bodies)
 */
export function createProceduralCanvasTexture(
  type: string,
  baseColorHex: string,
  secondaryColorHex?: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, width, height);

  if (type === 'sun') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#ff9900');
    grad.addColorStop(0.5, '#ffcc00');
    grad.addColorStop(1, '#ff4400');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const rad = 2 + Math.random() * 25;
      const spotGrad = ctx.createRadialGradient(x, y, 1, x, y, rad);
      spotGrad.addColorStop(0, 'rgba(255, 255, 200, 0.7)');
      spotGrad.addColorStop(0.6, 'rgba(255, 140, 0, 0.4)');
      spotGrad.addColorStop(1, 'rgba(200, 40, 0, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'gas_giant' || type === 'ringed_giant') {
    const secColor = secondaryColorHex || '#bc6c25';
    for (let y = 0; y < height; y += 4) {
      const bandFactor = Math.sin(y * 0.08) * 0.5 + 0.5;
      ctx.fillStyle = bandFactor > 0.4 ? baseColorHex : secColor;
      ctx.fillRect(0, y, width, 4);
    }
  } else {
    // Rocky / cratered
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 200; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const cr = 2 + Math.random() * 18;
      ctx.fillStyle = 'rgba(20, 20, 20, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(cx - cr * 0.2, cy - cr * 0.2, cr * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
