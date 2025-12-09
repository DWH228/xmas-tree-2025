export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface PositionData {
  scatter: Float32Array;
  tree: Float32Array;
}

export type OrnamentType = 'bauble' | 'gift' | 'light';

export interface OrnamentConfig {
  count: number;
  color: string;
  scale: number;
  roughness: number;
  metalness: number;
}