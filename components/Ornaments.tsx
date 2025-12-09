import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState, OrnamentType } from '../types';
import { TREE_HEIGHT, TREE_RADIUS_BASE, SCATTER_RADIUS, getConePoint, randomSpherePoint, COLORS } from '../constants';

interface OrnamentsProps {
  appState: AppState;
  type: OrnamentType;
  count: number;
}

const Ornaments: React.FC<OrnamentsProps> = ({ appState, type, count }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-calculate positions
  const data = useMemo(() => {
    const treePositions: THREE.Vector3[] = [];
    const scatterPositions: THREE.Vector3[] = [];
    const rotations: THREE.Euler[] = [];
    const scales: number[] = [];

    for (let i = 0; i < count; i++) {
      // Tree Position: slightly offset from cone surface to look like they are hanging
      const t = Math.random();
      const p = getConePoint(t, TREE_HEIGHT, TREE_RADIUS_BASE);
      // Push slightly outward or inward
      const offset = (Math.random() - 0.5) * 2; 
      p.add(new THREE.Vector3(offset, offset, offset).multiplyScalar(0.5));
      treePositions.push(p);

      // Scatter Position
      scatterPositions.push(randomSpherePoint(SCATTER_RADIUS * 1.2)); // Scatter wider than foliage

      // Random Rotation
      rotations.push(new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0));

      // Random Scale
      const baseScale = type === 'gift' ? 0.8 : 0.5;
      scales.push(baseScale + Math.random() * 0.4);
    }
    return { treePositions, scatterPositions, rotations, scales };
  }, [count, type]);

  // Current interpolated positions stored in refs to avoid re-render
  const currentPositions = useRef(data.scatterPositions.map(v => v.clone()));
  
  useLayoutEffect(() => {
    if (meshRef.current) {
        // Set initial colors if needed per instance, but we use material color
        // If we wanted multi-colored ornaments, we'd set instanceColor here
        const tempColor = new THREE.Color();
        for(let i=0; i<count; i++) {
             if (type === 'gift') {
                 // Randomize gift colors between gold and emerald
                 Math.random() > 0.5 ? tempColor.set(COLORS.gold) : tempColor.set(COLORS.emeraldLight);
                 meshRef.current.setColorAt(i, tempColor);
             } else {
                 // Baubles are gold or silver
                 Math.random() > 0.7 ? tempColor.set(COLORS.silver) : tempColor.set(COLORS.gold);
                 meshRef.current.setColorAt(i, tempColor);
             }
        }
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [count, type]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetPositions = appState === AppState.TREE_SHAPE ? data.treePositions : data.scatterPositions;
    const isTree = appState === AppState.TREE_SHAPE;

    // We manually interpolate positions on CPU for InstancedMesh to allow standard lighting
    // For 500 items, this is acceptable. For 20k, we used shaders.
    const lerpFactor = delta * (isTree ? 1.0 : 0.8); // Slower scatter, faster gather

    for (let i = 0; i < count; i++) {
      // Interpolate current position towards target
      currentPositions.current[i].lerp(targetPositions[i], lerpFactor);

      // Update dummy object
      dummy.position.copy(currentPositions.current[i]);
      
      // Floating animation
      dummy.position.y += Math.sin(state.clock.elapsedTime + i) * 0.01;
      
      // Rotate slowly
      dummy.rotation.copy(data.rotations[i]);
      dummy.rotation.x += state.clock.elapsedTime * 0.2;
      dummy.rotation.y += state.clock.elapsedTime * 0.1;

      dummy.scale.setScalar(data.scales[i]);
      
      // Apply visibility scale effect (shrink when scattering if desired, but we keep them visible)
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Material Selection
  const material = useMemo(() => {
    if (type === 'gift') {
        return new THREE.MeshStandardMaterial({
            color: 0xffffff, // Tinted by instanceColor
            roughness: 0.3,
            metalness: 0.6,
        });
    } else {
        return new THREE.MeshPhysicalMaterial({
            color: 0xffffff, // Tinted by instanceColor
            roughness: 0.1,
            metalness: 1.0,
            reflectivity: 1.0,
            clearcoat: 1.0,
        });
    }
  }, [type]);

  // Geometry Selection
  const geometry = useMemo(() => {
      if (type === 'gift') return new THREE.BoxGeometry(1, 1, 1);
      return new THREE.SphereGeometry(1, 32, 32);
  }, [type]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
};

export default Ornaments;