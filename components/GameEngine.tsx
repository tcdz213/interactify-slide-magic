
import React, { useRef, useEffect, useCallback } from 'react';
import { 
  GameState, Sphere, Player, Projectile, Particle, Planet, SphereSize, Vector, PowerUp, PowerUpType, FloatingText, Boss, BossProjectile, Obstacle 
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, PLAYER_SPEED, 
  PROJECTILE_SPEED, SPHERE_RADII, BOUNCE_HEIGHTS, POWERUP_SPAWN_CHANCE, POWERUP_LIFE, FREEZE_DURATION, RAPID_FIRE_DURATION, SHIELD_DURATION
} from '../constants';

interface GameEngineProps {
  gameState: GameState;
  planet: Planet;
  lives: number;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onLevelComplete: () => void;
  onGameOver: () => void;
}

const GameEngine: React.FC<GameEngineProps> = ({
  gameState,
  planet,
  lives,
  setLives,
  score,
  setScore,
  onLevelComplete,
  onGameOver
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Audio State
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<{
    master: GainNode;
    synth: GainNode;
    drums: GainNode;
    bass: GainNode;
    lpf: BiquadFilterNode;
  } | null>(null);
  const sequencerRef = useRef<number>(0);

  // Background State
  const starsRef = useRef<{x: number, y: number, s: number, o: number}[]>([]);
  if (starsRef.current.length === 0) {
    for(let i=0; i<120; i++) starsRef.current.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      s: 0.5 + Math.random() * 2,
      o: 0.1 + Math.random() * 0.8
    });
  }

  // GROUND_Y is where feet touch
  const GROUND_Y = CANVAS_HEIGHT - 10;

  // Game Objects - Player Y is now exactly on the floor line
  const playerRef = useRef<Player>({
    id: 'player',
    pos: { x: CANVAS_WIDTH / 2, y: GROUND_Y },
    vel: { x: 0, y: 0 },
    radius: 14,
    width: 36,
    height: 54, // Total visual height
    isInvulnerable: false,
    invulnerabilityTimer: 0,
    shieldTimer: 0,
    trail: []
  });

  const playerAnim = useRef({
    walkFrame: 0,
    isMoving: false,
    facing: 1,
    shootingTimer: 0,
    legSway: 0,
    stepTimer: 0
  });

  const spheresRef = useRef<Sphere[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const bossRef = useRef<Boss | null>(null);
  const bossProjectilesRef = useRef<BossProjectile[]>([]);
  
  const freezeTimerRef = useRef<number>(0);
  const rapidFireTimerRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const shakeAmountRef = useRef<number>(0);
  const keys = useRef<{ [key: string]: boolean }>({});

  const spawnParticles = useCallback((pos: Vector, color: string, count: number, velRange = 5) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: `p-${Math.random()}`,
        pos: { ...pos },
        vel: { x: (Math.random() - 0.5) * velRange, y: (Math.random() - 0.5) * velRange },
        life: 1.0,
        color
      });
    }
  }, []);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    
    const master = ctx.createGain();
    master.gain.value = 0.22;
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 20000;
    
    master.connect(lpf);
    lpf.connect(ctx.destination);

    const synth = ctx.createGain(); synth.connect(master);
    const drums = ctx.createGain(); drums.connect(master);
    const bass = ctx.createGain(); bass.connect(master);

    musicRef.current = { master, synth, drums, bass, lpf };
  }, []);

  const playPopSFX = useCallback((size: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350 + (3 - size) * 200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.1);

    const punch = ctx.createOscillator();
    const pg = ctx.createGain();
    punch.type = 'triangle';
    punch.frequency.setValueAtTime(80, ctx.currentTime);
    punch.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    pg.gain.setValueAtTime(0.3, ctx.currentTime);
    pg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    punch.connect(pg); pg.connect(ctx.destination);
    punch.start(); punch.stop(ctx.currentTime + 0.15);
  }, []);

  const playMusicStep = useCallback(() => {
    if (!audioCtxRef.current || !musicRef.current || gameState !== GameState.PLAYING) return;
    const { synth, drums, bass, lpf } = musicRef.current;
    const ctx = audioCtxRef.current;
    
    const isFrozen = freezeTimerRef.current > 0;
    lpf.frequency.setTargetAtTime(isFrozen ? 400 : 20000, ctx.currentTime, 0.15);

    const bpm = 128;
    const stepTime = isFrozen ? (60 / bpm) * 2 : (60 / bpm) / 2;
    if (frameCountRef.current % Math.floor(stepTime * 60) === 0) {
      sequencerRef.current = (sequencerRef.current + 1) % 16;
      
      // Cyber-Pop Beat
      if (sequencerRef.current % 4 === 0) {
        const k = ctx.createOscillator();
        const kg = ctx.createGain();
        k.frequency.setValueAtTime(150, ctx.currentTime);
        k.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        kg.gain.setValueAtTime(0.7, ctx.currentTime);
        kg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        k.connect(kg); kg.connect(drums);
        k.start(); k.stop(ctx.currentTime + 0.12);
      }
      if (sequencerRef.current % 4 === 2) {
        const noise = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const dat = buf.getChannelData(0);
        for(let i=0; i<dat.length; i++) dat[i] = Math.random()*2-1;
        noise.buffer = buf;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.15, ctx.currentTime);
        ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        noise.connect(ng); ng.connect(drums);
        noise.start();
      }

      // Neon Synth Hook (Major Pentatonic variations)
      const scale = [61, 63, 66, 68, 70, 73];
      const melodyIdx = [0, 2, 1, 3, 2, 4, 3, 5, 4, 2, 0, 1, 2, 4, 5, 0];
      const midi = scale[melodyIdx[sequencerRef.current]] + (planet.id * 2);
      
      const sOsc = ctx.createOscillator();
      const sG = ctx.createGain();
      sOsc.type = 'triangle';
      sOsc.frequency.setValueAtTime(440 * Math.pow(2, (midi-69)/12), ctx.currentTime);
      sG.gain.setValueAtTime(0.12, ctx.currentTime);
      sG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      sOsc.connect(sG); sG.connect(synth);
      sOsc.start(); sOsc.stop(ctx.currentTime + 0.2);

      // Pumping Bassline
      if (sequencerRef.current % 2 === 0) {
        const bOsc = ctx.createOscillator();
        const bG = ctx.createGain();
        bOsc.type = 'sawtooth';
        bOsc.frequency.setValueAtTime(440 * Math.pow(2, (midi-24-69)/12), ctx.currentTime);
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = 350;
        bG.gain.setValueAtTime(0.2, ctx.currentTime);
        bG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        bOsc.connect(f); f.connect(bG); bG.connect(bass);
        bOsc.start(); bOsc.stop(ctx.currentTime + 0.25);
      }
    }
  }, [planet, gameState]);

  const initLevel = useCallback(() => {
    playerRef.current.pos = { x: CANVAS_WIDTH / 2, y: GROUND_Y };
    playerRef.current.isInvulnerable = true;
    playerRef.current.invulnerabilityTimer = 180;
    playerRef.current.shieldTimer = 0;
    
    const newSpheres: Sphere[] = [];
    if (planet.id === 5) {
      bossRef.current = {
        health: 200, maxHealth: 200, pos: { x: CANVAS_WIDTH / 2, y: -100 }, vel: { x: 2.5, y: 1 },
        phase: 1, attackTimer: 100, isVulnerable: true, shieldRotation: 0
      };
    } else {
      bossRef.current = null;
      for (let i = 0; i < planet.initialSpheres; i++) {
        const size = SphereSize.LARGE;
        const radius = SPHERE_RADII[size];
        newSpheres.push({
          id: `s-${Date.now()}-${i}`,
          pos: { x: radius + Math.random() * (CANVAS_WIDTH - radius * 2), y: 150 + Math.random() * 80 },
          vel: { x: (i % 2 === 0 ? 2.2 : -2.2), y: 0 },
          radius, size, color: planet.sphereColor, bounceHeight: BOUNCE_HEIGHTS[size], trail: []
        });
      }
    }
    spheresRef.current = newSpheres;
    projectilesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    freezeTimerRef.current = 0;
    rapidFireTimerRef.current = 0;
    frameCountRef.current = 0;
    initAudio();
  }, [planet, initAudio, GROUND_Y]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space' && gameState === GameState.PLAYING) {
        const limit = rapidFireTimerRef.current > 0 ? 3 : 1;
        if (projectilesRef.current.filter(p=>p.active).length < limit) {
          projectilesRef.current.push({ id: `p-${Date.now()}`, x: playerRef.current.pos.x, currentHeight: 0, active: true });
          playerAnim.current.shootingTimer = 10;
          if (audioCtxRef.current) {
            const osc = audioCtxRef.current.createOscillator();
            const g = audioCtxRef.current.createGain();
            osc.frequency.setValueAtTime(1500, audioCtxRef.current.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, audioCtxRef.current.currentTime + 0.12);
            g.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.12);
            osc.connect(g); g.connect(audioCtxRef.current.destination);
            osc.start(); osc.stop(audioCtxRef.current.currentTime + 0.12);
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [gameState]);

  useEffect(() => { if (gameState === GameState.PLANET_INTRO) initLevel(); }, [gameState, initLevel]);

  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    playMusicStep();
    frameCountRef.current++;
    shakeAmountRef.current *= 0.9;

    const player = playerRef.current;
    if (freezeTimerRef.current > 0) freezeTimerRef.current--;
    if (rapidFireTimerRef.current > 0) rapidFireTimerRef.current--;
    
    const anim = playerAnim.current;
    anim.isMoving = false;
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) { 
      player.pos.x -= PLAYER_SPEED; 
      anim.isMoving = true; 
      anim.facing = -1; 
    }
    if (keys.current['ArrowRight'] || keys.current['KeyD']) { 
      player.pos.x += PLAYER_SPEED; 
      anim.isMoving = true; 
      anim.facing = 1; 
    }
    
    if (anim.isMoving) {
      anim.walkFrame += 0.3;
      if (frameCountRef.current % 3 === 0) {
        // Magnetic boot sparks
        spawnParticles({ x: player.pos.x, y: GROUND_Y }, planet.sphereColor, 1, 2);
      }
    } else {
      anim.walkFrame *= 0.85;
      if (anim.walkFrame < 0.01) anim.walkFrame = 0;
    }
    
    // Body sway based on movement
    anim.legSway = Math.sin(anim.walkFrame) * 4;

    if (anim.shootingTimer > 0) anim.shootingTimer--;
    player.pos.x = Math.max(player.width / 2, Math.min(CANVAS_WIDTH - player.width / 2, player.pos.x));

    if (player.isInvulnerable) {
      player.invulnerabilityTimer--;
      if (player.invulnerabilityTimer <= 0) player.isInvulnerable = false;
    }

    projectilesRef.current.forEach(proj => {
      if (proj.active) {
        proj.currentHeight += PROJECTILE_SPEED;
        const py = CANVAS_HEIGHT - proj.currentHeight;
        planet.obstacles.forEach(obs => {
          if (proj.x > obs.x && proj.x < obs.x + obs.width && py < obs.y + obs.height && py > obs.y) {
            proj.active = false;
            spawnParticles({ x: proj.x, y: py }, '#fff', 5, 3);
          }
        });
        if (py <= 0) proj.active = false;
      }
    });

    spheresRef.current.forEach(sphere => {
      if (freezeTimerRef.current <= 0) {
        sphere.pos.x += sphere.vel.x; sphere.vel.y += GRAVITY; sphere.pos.y += sphere.vel.y;
        if (sphere.pos.x - sphere.radius <= 0 || sphere.pos.x + sphere.radius >= CANVAS_WIDTH) { sphere.vel.x *= -1; }
        const floorY = GROUND_Y;
        if (sphere.pos.y + sphere.radius >= floorY) { sphere.pos.y = floorY - sphere.radius; sphere.vel.y = -Math.sqrt(2 * GRAVITY * sphere.bounceHeight); }
        
        planet.obstacles.forEach(obs => {
          const cx = Math.max(obs.x, Math.min(sphere.pos.x, obs.x + obs.width));
          const cy = Math.max(obs.y, Math.min(sphere.pos.y, obs.y + obs.height));
          const d2 = (sphere.pos.x - cx)**2 + (sphere.pos.y - cy)**2;
          if (d2 < sphere.radius**2) {
            if (Math.abs(sphere.pos.y - cy) > Math.abs(sphere.pos.x - cx)) sphere.vel.y *= -1;
            else sphere.vel.x *= -1;
          }
        });
      }
      
      projectilesRef.current.forEach(proj => {
        if (!proj.active) return;
        const py = CANVAS_HEIGHT - proj.currentHeight;
        if (Math.abs(sphere.pos.x - proj.x) < sphere.radius && sphere.pos.y + sphere.radius >= py) {
          proj.active = false; shakeAmountRef.current = 10;
          playPopSFX(sphere.size);
          setScore(prev => prev + (sphere.size * 100));
          spawnParticles(sphere.pos, sphere.color, 15, 6);
          
          if (Math.random() < POWERUP_SPAWN_CHANCE) {
            const types = [PowerUpType.FREEZE, PowerUpType.RAPID_FIRE, PowerUpType.SHIELD];
            powerUpsRef.current.push({ id: `pw-${Date.now()}`, pos: { ...sphere.pos }, vel: { x: 0, y: 2.8 }, radius: 12, type: types[Math.floor(Math.random()*3)], life: POWERUP_LIFE });
          }
          const ns = (sphere.size - 1) as SphereSize;
          if (ns >= SphereSize.SMALL) {
            const r = SPHERE_RADII[ns];
            spheresRef.current.push(
              { id: `s-${Date.now()}a`, pos: { ...sphere.pos }, vel: { x: -2.8, y: -4 }, radius: r, size: ns, color: sphere.color, bounceHeight: BOUNCE_HEIGHTS[ns], trail: [] },
              { id: `s-${Date.now()}b`, pos: { ...sphere.pos }, vel: { x: 2.8, y: -4 }, radius: r, size: ns, color: sphere.color, bounceHeight: BOUNCE_HEIGHTS[ns], trail: [] }
            );
          }
          spheresRef.current = spheresRef.current.filter(s => s.id !== sphere.id);
        }
      });

      // Player Collision - Visual offset 25 is approx center of body
      if (!player.isInvulnerable && Math.sqrt((player.pos.x - sphere.pos.x)**2 + (player.pos.y - 30 - sphere.pos.y)**2) < player.radius + sphere.radius) {
        if (player.shieldTimer > 0) {
          player.shieldTimer = 0; player.isInvulnerable = true; player.invulnerabilityTimer = 60;
          spawnParticles(player.pos, '#0ff', 20, 8);
        } else {
          setLives(l => l - 1); if (lives <= 1) onGameOver();
          player.isInvulnerable = true; player.invulnerabilityTimer = 120;
          spawnParticles(player.pos, '#f00', 30, 10);
        }
      }
    });

    powerUpsRef.current.forEach(pw => {
      pw.pos.y += pw.vel.y; if (pw.pos.y > GROUND_Y - 12) pw.pos.y = GROUND_Y - 12;
      if (Math.sqrt((player.pos.x - pw.pos.x)**2 + (player.pos.y - 30 - pw.pos.y)**2) < player.radius + pw.radius) {
        if (pw.type === PowerUpType.FREEZE) freezeTimerRef.current = FREEZE_DURATION;
        else if (pw.type === PowerUpType.RAPID_FIRE) rapidFireTimerRef.current = RAPID_FIRE_DURATION;
        else if (pw.type === PowerUpType.SHIELD) player.shieldTimer = SHIELD_DURATION;
        pw.life = 0;
        spawnParticles(pw.pos, '#fff', 10, 5);
      }
    });
    powerUpsRef.current = powerUpsRef.current.filter(pw => pw.life > 0);

    particlesRef.current.forEach(p => { p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life -= 0.02; });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    if (spheresRef.current.length === 0 && !bossRef.current) onLevelComplete();
  }, [gameState, planet, lives, onGameOver, onLevelComplete, setScore, playPopSFX, playMusicStep, spawnParticles, GROUND_Y]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    if (shakeAmountRef.current > 0) {
      ctx.translate((Math.random()-0.5)*shakeAmountRef.current, (Math.random()-0.5)*shakeAmountRef.current);
    }
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // COSMIC BACKGROUND
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    g.addColorStop(0, planet.bgColor); g.addColorStop(0.7, '#000'); g.addColorStop(1, '#050512');
    ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // PARALLAX STARS
    starsRef.current.forEach(s => {
      s.y += (s.s * 0.12); if (s.y > CANVAS_HEIGHT) s.y = 0;
      ctx.globalAlpha = s.o; ctx.fillStyle = "#fff";
      ctx.fillRect(s.x, s.y, s.s, s.s);
    });
    ctx.globalAlpha = 1;

    // GROUND GLOW
    const horizon = ctx.createLinearGradient(0, GROUND_Y - 100, 0, GROUND_Y);
    horizon.addColorStop(0, 'rgba(0,0,0,0)'); horizon.addColorStop(1, planet.sphereColor + '22');
    ctx.fillStyle = horizon; ctx.fillRect(0, GROUND_Y - 100, CANVAS_WIDTH, 100);

    // OBSTACLES
    planet.obstacles.forEach(obs => {
      const grad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
      grad.addColorStop(0, obs.color); grad.addColorStop(1, "#000");
      ctx.fillStyle = grad; ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });

    // PROJECTILES
    projectilesRef.current.forEach(p => {
      if (!p.active) return;
      const py = CANVAS_HEIGHT - p.currentHeight;
      const lg = ctx.createLinearGradient(p.x, CANVAS_HEIGHT, p.x, py);
      lg.addColorStop(0, 'transparent'); lg.addColorStop(0.5, '#0ff4'); lg.addColorStop(1, '#fff');
      ctx.strokeStyle = lg; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p.x, CANVAS_HEIGHT); ctx.lineTo(p.x, py); ctx.stroke();
      ctx.shadowBlur = 10; ctx.shadowColor = "#0ff"; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, py, 4, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    });

    // PLAYER - GROUNDED LOGIC
    const p = playerRef.current;
    const a = playerAnim.current;
    if (!p.isInvulnerable || frameCountRef.current % 10 < 6) {
      ctx.save();
      // Translate to floor position at player's feet
      ctx.translate(p.pos.x, p.pos.y);
      ctx.scale(a.facing, 1);
      
      // PROCEDURAL LEGS - Ensuring feet touch GROUND_Y
      ctx.fillStyle = "#334155";
      const walkCycle = a.walkFrame;
      const leg1Sway = Math.sin(walkCycle) * 12;
      const leg2Sway = Math.sin(walkCycle + Math.PI) * 12;
      const leg1Depth = Math.max(0, Math.cos(walkCycle) * 6);
      const leg2Depth = Math.max(0, Math.cos(walkCycle + Math.PI) * 6);

      // Draw Legs starting from body height up to ground
      // Body base is approx 18px above ground
      const bodyBaseY = -18;
      
      // Leg 1
      ctx.fillRect(-10, bodyBaseY, 8, 18 - leg1Depth);
      ctx.fillStyle = "#1e293b"; // Boot
      ctx.fillRect(-12, -leg1Depth - 4, 12, 4);

      // Leg 2
      ctx.fillStyle = "#334155";
      ctx.fillRect(2, bodyBaseY, 8, 18 - leg2Depth);
      ctx.fillStyle = "#1e293b"; // Boot
      ctx.fillRect(1, -leg2Depth - 4, 12, 4);
      
      // Body Bobbing - calculated to keep legs connected
      const bodyBob = -Math.max(leg1Depth, leg2Depth);
      
      // Cyber Suit Body
      ctx.translate(0, bodyBob);
      ctx.fillStyle = "#1e293b"; ctx.fillRect(-16, bodyBaseY - 32, 32, 32);
      ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2; ctx.strokeRect(-16, bodyBaseY - 32, 32, 32);
      
      // Neon Core
      ctx.fillStyle = "#00f2ff"; ctx.globalAlpha = 0.5 + Math.sin(frameCountRef.current*0.15)*0.3;
      ctx.fillRect(-8, bodyBaseY - 25, 16, 4); ctx.globalAlpha = 1;

      // Helmet
      ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.roundRect(-13, bodyBaseY - 50, 26, 20, 6); ctx.fill();
      ctx.fillStyle = "#00f2ff"; ctx.shadowBlur = 15; ctx.shadowColor = "#00f2ff";
      ctx.fillRect(-9, bodyBaseY - 45, 18, 6); ctx.shadowBlur = 0;
      
      // Shoulder Blaster
      ctx.fillStyle = "#475569"; ctx.fillRect(8, bodyBaseY - 40, 15, 9);
      if (a.shootingTimer > 0) {
        ctx.fillStyle = "#fff"; ctx.shadowBlur = 10; ctx.shadowColor = "#0ff";
        ctx.fillRect(20, bodyBaseY - 38, 5, 5); ctx.shadowBlur = 0;
      }

      ctx.restore();
    }

    // SHIELD
    if (p.shieldTimer > 0) {
      ctx.save(); ctx.translate(p.pos.x, p.pos.y - 30); ctx.rotate(frameCountRef.current * 0.1);
      ctx.strokeStyle = "#0ff"; ctx.lineWidth = 2; ctx.setLineDash([8,4]); ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }

    // SPHERES
    spheresRef.current.forEach(s => {
      const ig = ctx.createRadialGradient(s.pos.x-s.radius*0.3, s.pos.y-s.radius*0.3, s.radius*0.1, s.pos.x, s.pos.y, s.radius);
      const frozen = freezeTimerRef.current > 0;
      ig.addColorStop(0, "#fff"); ig.addColorStop(0.3, frozen ? "#0ff" : s.color); ig.addColorStop(1, "#000");
      ctx.fillStyle = ig; ctx.shadowBlur = 20; ctx.shadowColor = frozen ? "#0ff" : s.color;
      ctx.beginPath(); ctx.arc(s.pos.x, s.pos.y, s.radius, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    });

    // POWER-UPS
    powerUpsRef.current.forEach(pw => {
      ctx.fillStyle = pw.type === PowerUpType.FREEZE ? "#0ff" : pw.type === PowerUpType.RAPID_FIRE ? "#f90" : "#0f0";
      ctx.shadowBlur = 15; ctx.shadowColor = ctx.fillStyle as string;
      ctx.beginPath(); ctx.arc(pw.pos.x, pw.pos.y, pw.radius, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff"; ctx.font = "bold 12px Orbitron"; ctx.textAlign = "center";
      ctx.fillText(pw.type[0], pw.pos.x, pw.pos.y + 4);
    });

    // PARTICLES
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.fillRect(p.pos.x, p.pos.y, 3, 3);
    });
    ctx.globalAlpha = 1;

    // FLOOR LINE
    ctx.fillStyle = "#111"; ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 10);
    ctx.strokeStyle = planet.sphereColor + 'aa'; ctx.lineWidth = 3; 
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(CANVAS_WIDTH, GROUND_Y); ctx.stroke();
    // Floor highlights
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 4); ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 4); ctx.stroke();

    ctx.restore();
  }, [planet, GROUND_Y]);

  const loop = useCallback(() => {
    update();
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-black border-2 border-slate-900 shadow-2xl" />;
};

export default GameEngine;
