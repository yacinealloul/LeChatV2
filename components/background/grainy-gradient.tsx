"use client"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, memo } from "react"
import * as THREE from "three"

interface GrainyGradientProps {
    mousePosition: { x: number; y: number }
    isMobile?: boolean
    isInteracting?: boolean
}

const GrainyGradient = memo(({ mousePosition, isMobile = false, isInteracting = false }: GrainyGradientProps) => {
    const mesh = useRef<THREE.Mesh>(null)
    const { viewport, size } = useThree()
    const lastFrameTime = useRef(0)

    const uniforms = useMemo(
        () => ({
            iTime: { value: 0.0 },
            iResolution: { value: new THREE.Vector3() },
            iMouse: { value: new THREE.Vector2() },
            // Highly optimized uniforms for performance
            noiseIntensity: { value: isMobile ? 0.8 : 1.2 },
            noiseScale: { value: isMobile ? 1.2 : 1.8 },
            noiseSpeed: { value: isMobile ? 0.06 : 0.12 },
            // Reduced wave complexity for mobile
            waveIntensity: { value: isMobile ? 0.4 : 0.8 },
            waveSpeed: { value: isMobile ? 0.15 : 0.3 },
            // Disabled mouse interaction
            mouseInfluence: { value: 0.0 },
            mouseRadius: { value: 0.0 },
            liquidStrength: { value: 0.0 },
            // Performance optimization uniforms
            qualityLevel: { value: isMobile ? 0.5 : 1.0 },
            frameRate: { value: isMobile ? 30.0 : 60.0 },
        }),
        [isMobile],
    )

    useFrame((state) => {
        if (!mesh.current) return

        const now = state.clock.getElapsedTime()
        const targetFPS = isMobile ? 30 : 60
        const frameInterval = 1 / targetFPS

        // Limit frame rate for better performance
        if (now - lastFrameTime.current < frameInterval) return
        lastFrameTime.current = now

        // Update time with reduced precision on mobile
        uniforms.iTime.value = isMobile ? Math.floor(now * 30) / 30 : now

        // Update resolution from renderer size for accurate zoom/resize fit
        uniforms.iResolution.value.set(size.width, size.height, 1)

        // Disable mouse effects completely
        uniforms.iMouse.value.set(0.5, 0.5)
    })

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            fragmentShader: isMobile ? fragmentShaderMobile : fragmentShader,
            vertexShader,
            uniforms,
            transparent: false,
            depthTest: false,
            depthWrite: false,
        })
    }, [uniforms, isMobile])

    return (
        <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
})

export default GrainyGradient

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;
  // Optimized uniforms
  uniform float noiseIntensity;
  uniform float noiseScale;
  uniform float noiseSpeed;
  uniform float waveIntensity;
  uniform float waveSpeed;
  // Enhanced mouse interaction uniforms
  uniform float mouseInfluence;
  uniform float mouseRadius;
  uniform float liquidStrength;
  // Performance optimization uniforms
  uniform float qualityLevel;
  uniform float frameRate;
  varying vec2 vUv;

  // Mobile-optimized grain settings
  #define BLEND_MODE 2
  #define SPEED 1.8
  #define INTENSITY 0.06
  #define MEAN 0.0
  #define VARIANCE 0.4

  // Optimized noise function for mobile performance
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Enhanced liquid glass mouse effect - touch optimized
  float liquidGlassEffect(vec2 uv, vec2 mousePos) {
    float dist = distance(uv, mousePos);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    
    // Create ripple effect - simplified for mobile
    float ripple = sin(dist * 20.0 - iTime * 6.0) * 0.5 + 0.5;
    effect *= mix(0.4, 1.0, ripple);
    
    // Add pulsing effect
    float pulse = sin(iTime * 3.0) * 0.15 + 0.85;
    effect *= pulse;
    
    return effect;
  }

  // Optimized domain warping with liquid glass
  vec2 liquidWarp(vec2 p) {
    float liquidEffect = liquidGlassEffect(vUv, iMouse);
    
    // Base noise warping - simplified for performance
    float n1 = noise(p * noiseScale + vec2(iTime * noiseSpeed, 0.0));
    float n2 = noise(p * noiseScale + vec2(0.0, iTime * noiseSpeed * 0.7));
    
    // Enhanced liquid glass distortion - touch friendly
    vec2 mouseDir = normalize(p - iMouse);
    float liquidWave = sin(distance(p, iMouse) * 12.0 - iTime * 5.0) * liquidEffect;
    vec2 liquidDistortion = mouseDir * liquidWave * liquidStrength * 0.12;
    
    // Simplified swirl effect for mobile performance
    float angle = atan(p.y - iMouse.y, p.x - iMouse.x);
    float swirl = sin(angle * 2.0 + iTime * 1.5) * liquidEffect * 0.08;
    vec2 swirlDistortion = vec2(-sin(angle), cos(angle)) * swirl;
    
    return p + vec2(n1, n2) * (waveIntensity + liquidEffect * 0.4) + liquidDistortion + swirlDistortion;
  }

  // Optimized grain functions
  vec3 channel_mix(vec3 a, vec3 b, vec3 w) {
    return vec3(mix(a.r, b.r, w.r), mix(a.g, b.g, w.g), mix(a.b, b.b, w.b));
  }

  float gaussian(float z, float u, float o) {
    return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
  }

  vec3 overlay(vec3 a, vec3 b, float w) {
    return mix(a, channel_mix(
      2.0 * a * b,
      vec3(1.0) - 2.0 * (vec3(1.0) - a) * (vec3(1.0) - b),
      step(vec3(0.5), a)
    ), w);
  }

  // Convert hex colors to RGB
  vec3 hexToRgb(float r, float g, float b) {
    return vec3(r / 255.0, g / 255.0, b / 255.0);
  }

  // Mistral brand color gradient (placeholder stops)
  vec3 mistralBrandGradient(float t) {
    // Placeholder stops; replace with actual Mistral brand colors
    vec3 colors[7];
    colors[0] = hexToRgb(0.0, 0.0, 0.0);       // Black (top)
    colors[1] = hexToRgb(60.0, 0.0, 0.0);      // Dark transition
    colors[2] = hexToRgb(139.0, 0.0, 0.0);     // Dark red
    colors[3] = hexToRgb(221.0, 0.0, 0.0);     // Middle stop
    colors[4] = hexToRgb(255.0, 87.0, 51.0);   // Red to gold transition
    colors[5] = hexToRgb(255.0, 152.0, 0.0);   // Golden orange
    colors[6] = hexToRgb(255.0, 206.0, 0.0);   // Bottom stop
    
    t = clamp(t, 0.0, 1.0);
    float scaledT = t * 6.0;
    int index = int(floor(scaledT));
    float localT = fract(scaledT);
    
    if (index >= 6) {
      return colors[6];
    }
    
    float smoothT = smoothstep(0.0, 1.0, localT);
    return mix(colors[index], colors[index + 1], smoothT);
  }

  // Optimized grain application
  vec3 applyGrain(vec3 color, vec2 uv) {
    float t = iTime * SPEED;
    float seed = dot(uv, vec2(12.9898, 78.233));
    float grainNoise = fract(sin(seed) * 43758.5453 + t);
    grainNoise = gaussian(grainNoise, MEAN, VARIANCE * VARIANCE);
    
    vec3 grain = vec3(grainNoise) * (1.0 - color);
    return overlay(color, grain, INTENSITY);
  }

  void mainImage(out vec4 O, in vec2 I) {
    vec2 uv = (I - 0.5 * iResolution.xy) / iResolution.y;
    
    // Calculate liquid glass effect
    float liquidEffect = liquidGlassEffect(vUv, iMouse);
    
    // Apply enhanced liquid warping
    vec2 warpedUv = liquidWarp(uv);
    
    // Optimized wave generation
    float phase = iTime * waveSpeed;
    float wave1 = sin(warpedUv.x * 2.5 + phase) * 0.4;
    float wave2 = sin(warpedUv.x * 4.0 - phase * 0.8) * 0.25;
    
    // Enhanced liquid glass wave interaction - touch optimized
    float liquidWave = sin(warpedUv.x * 5.0 + liquidEffect * 6.0 - phase * 1.5) * liquidEffect * 0.25;
    
    float combinedWave = (wave1 + wave2 + liquidWave) * 0.2;
    
    // CORRECTED: Use vUv.y directly for proper Black->Red->Gold order
    float gradientPos = vUv.y + combinedWave + liquidEffect * 0.06;
    
    // Enhanced liquid ripples - touch friendly
    float rippleEffect = sin(distance(vUv, iMouse) * 18.0 - iTime * 8.0) * liquidEffect * 0.03;
    gradientPos += rippleEffect;
    
    float smoothGradientPos = smoothstep(0.0, 1.0, clamp(gradientPos, 0.0, 1.0));
    vec3 color = mistralBrandGradient(smoothGradientPos);
    
    // Apply grain with liquid enhancement
    vec3 finalColor = applyGrain(color, vUv);
    
    // Enhanced brightness and saturation near mouse/touch
    finalColor += liquidEffect * 0.06;
    finalColor = mix(finalColor, finalColor * 1.1, liquidEffect * 0.25);
    
    O = vec4(finalColor, 1.0);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    mainImage(gl_FragColor, fragCoord);
  }
`

// Mobile-optimized shader with reduced complexity
const fragmentShaderMobile = `
  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;
  // Simplified mobile uniforms
  uniform float noiseIntensity;
  uniform float noiseScale;
  uniform float noiseSpeed;
  uniform float waveIntensity;
  uniform float waveSpeed;
  uniform float mouseInfluence;
  uniform float mouseRadius;
  uniform float liquidStrength;
  uniform float qualityLevel;
  uniform float frameRate;
  varying vec2 vUv;

  // Simplified noise for mobile
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Simplified liquid effect for mobile
  float liquidGlassEffect(vec2 uv, vec2 mousePos) {
    float dist = distance(uv, mousePos);
    return 1.0 - smoothstep(0.0, mouseRadius, dist);
  }

  // Simplified domain warping for mobile
  vec2 liquidWarp(vec2 p) {
    float liquidEffect = liquidGlassEffect(vUv, iMouse);
    float n1 = noise(p * noiseScale * 0.8 + vec2(iTime * noiseSpeed, 0.0));
    return p + vec2(n1, n1 * 0.7) * (waveIntensity * 0.6 + liquidEffect * 0.2);
  }

  // Simplified Mistral brand gradient (placeholder)
  vec3 mistralBrandGradient(float t) {
    t = clamp(t, 0.0, 1.0);
    
    if (t < 0.33) {
      return mix(vec3(0.0), vec3(0.6, 0.0, 0.0), t * 3.0);
    } else if (t < 0.66) {
      return mix(vec3(0.6, 0.0, 0.0), vec3(1.0, 0.3, 0.0), (t - 0.33) * 3.0);
    } else {
      return mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 0.8, 0.0), (t - 0.66) * 3.0);
    }
  }

  // Simplified grain for mobile
  vec3 applyGrain(vec3 color, vec2 uv) {
    float grainNoise = fract(sin(dot(uv, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    return mix(color, color * grainNoise, 0.03);
  }

  void mainImage(out vec4 O, in vec2 I) {
    vec2 uv = (I - 0.5 * iResolution.xy) / iResolution.y;
    
    float liquidEffect = liquidGlassEffect(vUv, iMouse);
    vec2 warpedUv = liquidWarp(uv);
    
    // Simplified wave generation
    float wave = sin(warpedUv.x * 2.0 + iTime * waveSpeed) * 0.2;
    float gradientPos = vUv.y + wave + liquidEffect * 0.03;
    
    vec3 color = mistralBrandGradient(clamp(gradientPos, 0.0, 1.0));
    vec3 finalColor = applyGrain(color, vUv);
    
    // Subtle liquid enhancement
    finalColor += liquidEffect * 0.03;
    
    O = vec4(finalColor, 1.0);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    mainImage(gl_FragColor, fragCoord);
  }
`
