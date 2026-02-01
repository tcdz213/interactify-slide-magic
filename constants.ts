
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
  },
  {
    id: 6,
    name: "Crimson Void",
    description: "Where light bends and reality warps",
    bgColor: "#1a0a0a",
    sphereColor: "#ff4444",
    initialSpheres: 4,
    obstacles: [
      { x: 200, y: 300, width: 80, height: 12, color: "#dc2626" },
      { x: 520, y: 300, width: 80, height: 12, color: "#dc2626" },
      { x: 360, y: 180, width: 80, height: 12, color: "#dc2626" }
    ]
  },
  {
    id: 7,
    name: "Phantom Grid",
    description: "Digital ghosts haunt the network",
    bgColor: "#0d0d1a",
    sphereColor: "#8b5cf6",
    initialSpheres: 5,
    obstacles: [
      { x: 100, y: 250, width: 60, height: 200, color: "#7c3aed" },
      { x: 640, y: 250, width: 60, height: 200, color: "#7c3aed" }
    ]
  },
  {
    id: 8,
    name: "Golden Abyss",
    description: "Ancient treasures in the deep",
    bgColor: "#1a1505",
    sphereColor: "#fbbf24",
    initialSpheres: 5,
    obstacles: [
      { x: 150, y: 380, width: 100, height: 10, color: "#d97706" },
      { x: 350, y: 280, width: 100, height: 10, color: "#d97706" },
      { x: 550, y: 380, width: 100, height: 10, color: "#d97706" }
    ]
  },
  {
    id: 9,
    name: "Obsidian Maze",
    description: "Labyrinth of forgotten code",
    bgColor: "#0a0a0a",
    sphereColor: "#64748b",
    initialSpheres: 6,
    obstacles: [
      { x: 180, y: 200, width: 15, height: 150, color: "#475569" },
      { x: 350, y: 300, width: 100, height: 15, color: "#475569" },
      { x: 605, y: 200, width: 15, height: 150, color: "#475569" }
    ]
  },
  {
    id: 10,
    name: "Omega Station",
    description: "Final frontier of existence",
    bgColor: "#050510",
    sphereColor: "#f0abfc",
    initialSpheres: 6,
    obstacles: [
      { x: 100, y: 350, width: 120, height: 12, color: "#c026d3" },
      { x: 300, y: 220, width: 200, height: 12, color: "#c026d3" },
      { x: 580, y: 350, width: 120, height: 12, color: "#c026d3" },
      { x: 380, y: 450, width: 40, height: 80, color: "#c026d3" }
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
