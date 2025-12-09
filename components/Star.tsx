import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState } from '../types';
import { TREE_HEIGHT, SCATTER_RADIUS, randomSpherePoint, COLORS } from '../constants';

interface StarProps {
  appState: AppState;
}

const Star: React.FC<StarProps> = ({ appState }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const { treePos, scatterPos } = useMemo(() => {
    // Tree top position. Tree is centered at 0, goes from -height/2 to +height/2.
    // We place star at the very peak.
    const treePos = new THREE.Vector3(0, (TREE_HEIGHT / 2) + 0.5, 0);
    const scatterPos = randomSpherePoint(SCATTER_RADIUS * 0.5); // Keep it somewhat central even when scattered
    // Adjust scatter pos to be higher up generally to not get lost in the floor
    scatterPos.y = Math.abs(scatterPos.y) + 5; 
    return { treePos, scatterPos };
  }, []);

  const currentPos = useRef(scatterPos.clone());

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const target = appState === AppState.TREE_SHAPE ? treePos : scatterPos;
    const isTree = appState === AppState.TREE_SHAPE;
    
    // Smooth movement interpolation
    const lerpSpeed = delta * (isTree ? 2.0 : 0.8);
    currentPos.current.lerp(target, lerpSpeed);
    groupRef.current.position.copy(currentPos.current);

    // Rotation animation
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.5;
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;

    // Bobbing motion when in tree state
    if (isTree) {
        groupRef.current.position.y += Math.sin(t * 2) * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Intense Glow Light */}
      <pointLight color={COLORS.glow} intensity={500} distance={10} decay={1} />
      
      {/* Central Gem */}
      <mesh castShadow>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial 
            color={COLORS.gold} 
            emissive={COLORS.gold}
            emissiveIntensity={1.0}
            roughness={0.1}
            metalness={1.0}
        />
      </mesh>
      
      {/* Outer Star Spikes (Rotated) */}
      <mesh rotation={[0, Math.PI / 4, 0]} scale={[1.4, 1.4, 1.4]}>
        <octahedronGeometry args={[1.2, 0]} />
         <meshStandardMaterial 
            color={COLORS.gold} 
            emissive={COLORS.gold}
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={1.0}
            transparent
            opacity={0.9}
        />
      </mesh>

      {/* Decorative Halo Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
         <torusGeometry args={[1.5, 0.05, 16, 100]} />
         <meshBasicMaterial color={COLORS.gold} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export default Star;