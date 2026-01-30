
import { Planet } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const GRAVITY = 0.22;
export const PLAYER_SPEED = 5.5;
export const PROJECTILE_SPEED = 11;
export const FRICTION = 0.99;

export const POWERUP_SPAWN_CHANCE = 0.25;
export const POWERUP_LIFE = 600;
export const FREEZE_DURATION = 360;
export const RAPID_FIRE_DURATION = 500;
export const SHIELD_DURATION = 500;

export const PLANETS: Planet[] = [
  {
    id: 1,
    name: "Neon Crystalis",
    description: "Digital crystal structures hum with energy",
    bgColor: "#0f051a",
    sphereColor: "#00f2ff",
    initialSpheres: 2,
    obstacles: []
  },
  {
    id: 2,
    name: "Jade Nexus",
    description: "Cyber-jungles hiding ancient technologies",
    bgColor: "#021a0f",
    sphereColor: "#39ff14",
    initialSpheres: 3,
    obstacles: [
      { x: 150, y: 350, width: 120, height: 15, color: "#10b981" },
      { x: 530, y: 350, width: 120, height: 15, color: "#10b981" }
    ]
  },
  {
    id: 3,
    name: "Solaris Core",
    description: "Molten circuits beneath the surface",
    bgColor: "#1a0505",
    sphereColor: "#ff3131",
    initialSpheres: 3,
    obstacles: [
      { x: 380, y: 250, width: 40, height: 150, color: "#f97316" }
    ]
  },
  {
    id: 4,
    name: "Azure Frontier",
    description: "Absolute zero containment zone",
    bgColor: "#05162e",
    sphereColor: "#00d4ff",
    initialSpheres: 4,
    obstacles: [
      { x: 100, y: 200, width: 150, height: 15, color: "#3b82f6" },
      { x: 550, y: 200, width: 150, height: 15, color: "#3b82f6" },
      { x: 300, y: 400, width: 200, height: 15, color: "#3b82f6" }
    ]
  },
  {
    id: 5,
    name: "Singularity Base",
    description: "The edge of known space-time",
    bgColor: "#0a0a0f",
    sphereColor: "#ff00ff",
    initialSpheres: 5,
    obstacles: [
      { x: 50, y: 450, width: 100, height: 8, color: "#a855f7" },
      { x: 650, y: 450, width: 100, height: 8, color: "#a855f7" }
    ]
  }
];

export const SPHERE_RADII = {
  3: 40,
  2: 20,
  1: 10
};

export const BOUNCE_HEIGHTS = {
  3: 420,
  2: 320,
  1: 220
};
