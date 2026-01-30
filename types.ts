
export enum GameState {
  START_SCREEN,
  PLANET_INTRO,
  PLAYING,
  LEVEL_COMPLETE,
  GAME_OVER,
  VICTORY
}

export enum SphereSize {
  LARGE = 3,
  MEDIUM = 2,
  SMALL = 1
}

export enum PowerUpType {
  FREEZE = 'FREEZE',
  RAPID_FIRE = 'RAPID_FIRE',
  SHIELD = 'SHIELD'
}

export interface Vector {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  pos: Vector;
  vel: Vector;
  radius: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Sphere extends GameObject {
  size: SphereSize;
  color: string;
  bounceHeight: number;
  trail: Vector[];
}

export interface Player extends GameObject {
  width: number;
  height: number;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  shieldTimer: number;
  trail: Vector[];
}

export interface PowerUp extends GameObject {
  type: PowerUpType;
  life: number;
}

export interface Projectile {
  id: string;
  x: number;
  currentHeight: number;
  active: boolean;
}

export interface Particle {
  id: string;
  pos: Vector;
  vel: Vector;
  life: number;
  color: string;
}

export interface FloatingText {
  id: string;
  pos: Vector;
  text: string;
  color: string;
  life: number;
  size: number;
}

export interface Planet {
  id: number;
  name: string;
  description: string;
  bgColor: string;
  sphereColor: string;
  initialSpheres: number;
  obstacles: Obstacle[]; // New: environmental layout
}

export interface Boss {
  health: number;
  maxHealth: number;
  pos: Vector;
  vel: Vector;
  phase: number;
  attackTimer: number;
  isVulnerable: boolean;
  shieldRotation: number;
  deathTimer?: number; // New: for death sequence
}

export interface BossProjectile {
  id: string;
  pos: Vector;
  vel: Vector;
  radius: number;
  isHoming?: boolean;
}
