import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { AppState } from '../types';
import { COLORS, BAUBLE_COUNT, GIFT_COUNT, TREE_HEIGHT } from '../constants';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Star from './Star';

interface SceneProps {
  appState: AppState;
}

const Rig = ({ appState }: { appState: AppState }) => {
    // Subtle camera movement
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        // Add a slow drift
        state.camera.position.x += Math.sin(t * 0.1) * 0.02;
    });
    return null;
}

const Scene: React.FC<SceneProps> = ({ appState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      shadows
    >
      <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={50} />
      <Rig appState={appState} />
      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={50} 
        autoRotate={appState === AppState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* Environment & Lighting */}
      <color attach="background" args={[COLORS.emeraldDark]} />
      <fog attach="fog" args={[COLORS.emeraldDark, 15, 60]} />
      
      <ambientLight intensity={0.2} />
      
      {/* Key Light (Gold) */}
      <spotLight
        position={[20, 20, 20]}
        angle={0.25}
        penumbra={1}
        intensity={2000}
        color={COLORS.gold}
        castShadow
        shadow-bias={-0.0001}
      />
      
      {/* Fill Light (Cool) */}
      <pointLight position={[-20, -10, -20]} intensity={500} color="#204040" />
      
      {/* Back Light (Rim) */}
      <spotLight position={[0, 10, -20]} intensity={1000} color={COLORS.silver} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* 3D Content */}
      <Suspense fallback={null}>
        <group position={[0, -5, 0]}>
            <Star appState={appState} />
            <Foliage appState={appState} />
            <Ornaments appState={appState} type="bauble" count={BAUBLE_COUNT} />
            <Ornaments appState={appState} type="gift" count={GIFT_COUNT} />
            
            {/* Ground Reflection - Positioned at the bottom of the tree (-TREE_HEIGHT/2) */}
            <ContactShadows 
                position={[0, -TREE_HEIGHT / 2, 0]}
                opacity={0.6} 
                scale={40} 
                blur={2.5} 
                far={10} 
                resolution={512} 
                color="#000000" 
            />
        </group>
        
        {/* Shiny environment map */}
        <Environment preset="city" />
      </Suspense>

      {/* Post Processing for Cinematic Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.4}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;