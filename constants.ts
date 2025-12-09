import * as THREE from 'three';

export const COLORS = {
  emeraldDark: '#00241B',
  emeraldLight: '#005C45',
  gold: '#FFD700',
  goldRose: '#E0BFB8',
  silver: '#C0C0C0',
  glow: '#FFFACD', // Lemon Chiffon for warm glow
};

// Tree Dimensions
export const TREE_HEIGHT = 18;
export const TREE_RADIUS_BASE = 7;
export const SCATTER_RADIUS = 25;

// Counts
export const FOLIAGE_COUNT = 35000;
export const BAUBLE_COUNT = 300;
export const GIFT_COUNT = 80;

// Animation
export const ANIMATION_SPEED = 1.5; // Speed of morphing

// Math Helpers
export const randomSpherePoint = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random()); // Cubic root for uniform distribution
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

export const getConePoint = (t: number, height: number, baseRadius: number) => {
  // t is normalized 0-1 (height progress)
  const y = (t * height) - (height / 2); // Center vertically
  const r = baseRadius * (1 - t); // Radius shrinks as we go up
  
  // Golden Angle spiral
  const angle = t * height * 10; // Density factor
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  
  // Add some noise/jitter to make it organic
  const jitter = 0.5;
  return new THREE.Vector3(
    x + (Math.random() - 0.5) * jitter, 
    y, 
    z + (Math.random() - 0.5) * jitter
  );
};