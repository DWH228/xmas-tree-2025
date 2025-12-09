import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState } from '../types';
import { FOLIAGE_COUNT, TREE_HEIGHT, TREE_RADIUS_BASE, SCATTER_RADIUS, getConePoint, randomSpherePoint, COLORS } from '../constants';

// Custom Shader for high-performance morphing and glowing
const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = Scatter, 1 = Tree
    uColorBase: { value: new THREE.Color(COLORS.emeraldDark) },
    uColorTip: { value: new THREE.Color(COLORS.emeraldLight) },
    uColorGold: { value: new THREE.Color(COLORS.gold) },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying float vRandom;
    varying float vHeight;

    // Cubic easing for smooth transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      vRandom = aRandom;
      
      // Calculate mixed position
      float t = easeInOutCubic(uProgress);
      
      // Add a slight swirl effect during transition based on height and random
      float swirl = sin(uProgress * 3.14) * 5.0 * aRandom;
      
      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      // Add breathing animation
      float breathe = sin(uTime * 2.0 + aRandom * 10.0) * 0.1;
      pos += normalize(pos) * breathe;

      // Pass height to fragment for gradient
      vHeight = (aTreePos.y + 10.0) / 20.0; // Normalize approx height

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      gl_PointSize = (4.0 * aRandom + 2.0) * (30.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorBase;
    uniform vec3 uColorTip;
    uniform vec3 uColorGold;
    
    varying float vRandom;
    varying float vHeight;

    void main() {
      // Circular particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      if(length(coord) > 0.5) discard;

      // Mix colors based on height and randomness
      vec3 color = mix(uColorBase, uColorTip, vHeight + (vRandom * 0.2));
      
      // Add golden sparkles randomly
      if (vRandom > 0.9) {
        color = mix(color, uColorGold, 0.8);
      }

      // Soft edge
      float strength = 1.0 - (length(coord) * 2.0);
      strength = pow(strength, 1.5);

      gl_FragColor = vec4(color, strength);
    }
  `
};

interface FoliageProps {
  appState: AppState;
}

const Foliage: React.FC<FoliageProps> = ({ appState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate attributes once
  const { positions, scatterPos, treePos, randoms } = useMemo(() => {
    const positions = new Float32Array(FOLIAGE_COUNT * 3);
    const scatterPos = new Float32Array(FOLIAGE_COUNT * 3);
    const treePos = new Float32Array(FOLIAGE_COUNT * 3);
    const randoms = new Float32Array(FOLIAGE_COUNT);

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      // Tree Shape
      const t = Math.random(); // Height progress
      const treePoint = getConePoint(t, TREE_HEIGHT, TREE_RADIUS_BASE);
      
      // Scatter Shape
      const scatterPoint = randomSpherePoint(SCATTER_RADIUS);

      treePos[i * 3] = treePoint.x;
      treePos[i * 3 + 1] = treePoint.y;
      treePos[i * 3 + 2] = treePoint.z;

      scatterPos[i * 3] = scatterPoint.x;
      scatterPos[i * 3 + 1] = scatterPoint.y;
      scatterPos[i * 3 + 2] = scatterPoint.z;

      // Initial buffer (doesn't matter much as shader overrides)
      positions[i * 3] = scatterPoint.x;
      positions[i * 3 + 1] = scatterPoint.y;
      positions[i * 3 + 2] = scatterPoint.z;

      randoms[i] = Math.random();
    }

    return { positions, scatterPos, treePos, randoms };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const target = appState === AppState.TREE_SHAPE ? 1 : 0;
      // Smooth lerp for the uProgress uniform
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        target,
        delta * 1.5 // Speed
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={FOLIAGE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={FOLIAGE_COUNT}
          array={scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={FOLIAGE_COUNT}
          array={treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={FOLIAGE_COUNT}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;