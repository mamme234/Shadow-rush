import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { GameEngine } from '../../engine/GameEngine';
import { LevelData, PlayerStats, TouchControlsConfig } from '../../types/game';
import { HUD } from './HUD';
import { VirtualControls } from './VirtualControls';
import { PauseModal } from './PauseModal';
import { LevelCompleteModal } from './LevelCompleteModal';
import { GameOverModal } from './GameOverModal';
import { THEME } from '../../constants/theme';
import { audio } from '../../services/audioService';
import Svg, { Circle, G, Rect } from 'react-native-svg';

interface GameViewProps {
  level: LevelData;
  playerStats: PlayerStats;
  cosmetics: { skin: string; trail: string };
  touchConfig: TouchControlsConfig;
  onLevelComplete: (stars: number, stats: { time: number; shards: number; score: number }) => void;
  onNextLevel: () => void;
  onExit: () => void;
  hasNextLevel: boolean;
}

export const GameView: React.FC<GameViewProps> = ({
  level,
  playerStats,
  cosmetics,
  touchConfig,
  onLevelComplete,
  onNextLevel,
  onExit,
  hasNextLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Responsive dimensions
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completionData, setCompletionData] = useState<{
    stars: number;
    time: number;
    shards: number;
    score: number;
    xp: number;
  }>({ stars: 0, time: 0, shards: 0, score: 0, xp: 0 });

  // Input states
  const inputRef = useRef({
    moveDir: 0,
    isCrouching: false,
    jumpPressed: false,
  });

  // Camera coordinates
  const cameraRef = useRef({ x: 0, y: 0, shake: 0 });

  // Force re-render periodically for HUD updates
  const [, setTick] = useState(0);

  // Initialize Game Engine
  useEffect(() => {
    const engine = new GameEngine(level, playerStats, cosmetics, {
      onCollectShard: () => {
        // Shard collected
      },
      onPlayerDeath: () => {
        setIsGameOver(true);
      },
      onLevelComplete: (stars, stats) => {
        setIsComplete(true);
        const xpEarned = stars * 150 + 200;
        setCompletionData({
          stars,
          time: stats.time,
          shards: stats.shards,
          score: stats.score,
          xp: xpEarned,
        });
        onLevelComplete(stars, stats);
      },
    });

    engineRef.current = engine;
    audio.startBgm();

    const handleResize = () => {
      setWindowDimensions(Dimensions.get('window'));
    };
    const sub = Dimensions.addEventListener('change', handleResize);

    return () => {
      sub?.remove();
      audio.stopBgm();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [level.id]);

  // Keyboard controls listener (Web / Desktop)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.moveDir = -1;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.moveDir = 1;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        inputRef.current.isCrouching = true;
        engine.handleCrouch(true);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        if (!inputRef.current.jumpPressed) {
          inputRef.current.jumpPressed = true;
          engine.handleJumpPress();
        }
      } else if (e.key === 'j' || e.key === 'J' || e.key === 'z' || e.key === 'Z') {
        engine.handleAttack();
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'Shift') {
        engine.handleDash();
      } else if (e.key === 'l' || e.key === 'L' || e.key === 'x' || e.key === 'X') {
        engine.handleSpecial();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (
        (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') &&
        inputRef.current.moveDir === -1
      ) {
        inputRef.current.moveDir = 0;
      } else if (
        (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') &&
        inputRef.current.moveDir === 1
      ) {
        inputRef.current.moveDir = 0;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        inputRef.current.isCrouching = false;
        engine.handleCrouch(false);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        inputRef.current.jumpPressed = false;
        engine.handleJumpRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60 FPS Render Loop
  useEffect(() => {
    let hudTimer = 0;

    const tick = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const dt = Math.min(0.05, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      const engine = engineRef.current;
      const canvas = canvasRef.current;

      if (engine && !isPaused && !isGameOver && !isComplete) {
        // Apply active movement input
        engine.handleMove(inputRef.current.moveDir);
        engine.update(dt);

        hudTimer += dt;
        if (hudTimer > 0.1) {
          hudTimer = 0;
          setTick((t) => t + 1);
        }
      }

      // Render to Canvas
      if (canvas && engine) {
        renderGame(canvas, engine, windowDimensions.width, windowDimensions.height);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, isGameOver, isComplete, windowDimensions]);

  // Drawing Function
  const renderGame = (
    canvas: HTMLCanvasElement,
    engine: GameEngine,
    viewW: number,
    viewH: number
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (canvas.width !== viewW * dpr || canvas.height !== viewH * dpr) {
      canvas.width = viewW * dpr;
      canvas.height = viewH * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Camera follow (center on player with lerp)
    const targetCamX = engine.player.x + engine.player.width / 2 - viewW / 2;
    const targetCamY = engine.player.y + engine.player.height / 2 - viewH / 2;

    const maxCamX = Math.max(0, engine.level.width - viewW);
    const maxCamY = Math.max(0, engine.level.height - viewH);

    const clampedTargetX = Math.max(0, Math.min(maxCamX, targetCamX));
    const clampedTargetY = Math.max(0, Math.min(maxCamY, targetCamY));

    cameraRef.current.x += (clampedTargetX - cameraRef.current.x) * 0.12;
    cameraRef.current.y += (clampedTargetY - cameraRef.current.y) * 0.12;

    const camX = cameraRef.current.x;
    const camY = cameraRef.current.y;

    // 1. Draw Parallax Background
    // Deep Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
    skyGrad.addColorStop(0, '#040608');
    skyGrad.addColorStop(0.5, '#0a1017');
    skyGrad.addColorStop(1, '#111b22');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, viewW, viewH);

    // Giant Glowing Moon
    const moonScreenX = viewW * 0.75 - camX * 0.04;
    const moonScreenY = viewH * 0.28 - camY * 0.04;
    const moonGrad = ctx.createRadialGradient(
      moonScreenX,
      moonScreenY,
      10,
      moonScreenX,
      moonScreenY,
      70
    );
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.4, '#cbe3eb');
    moonGrad.addColorStop(0.8, 'rgba(72, 202, 228, 0.25)');
    moonGrad.addColorStop(1, 'rgba(72, 202, 228, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonScreenX, moonScreenY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Distant Mist & Mountains (0.15x parallax)
    ctx.fillStyle = 'rgba(18, 30, 38, 0.45)';
    ctx.beginPath();
    const mountainOffset = -(camX * 0.15) % 400;
    for (let x = -400; x < viewW + 400; x += 180) {
      const mx = x + mountainOffset;
      ctx.lineTo(mx, viewH * 0.45);
      ctx.lineTo(mx + 90, viewH * 0.28);
      ctx.lineTo(mx + 180, viewH * 0.45);
    }
    ctx.lineTo(viewW + 400, viewH);
    ctx.lineTo(-400, viewH);
    ctx.closePath();
    ctx.fill();

    // Midground Pine Silhouettes (0.35x parallax)
    ctx.fillStyle = 'rgba(10, 18, 22, 0.7)';
    const pineOffset = -(camX * 0.35) % 200;
    for (let x = -200; x < viewW + 200; x += 90) {
      const px = x + pineOffset;
      ctx.beginPath();
      ctx.moveTo(px, viewH);
      ctx.lineTo(px + 45, viewH * 0.52);
      ctx.lineTo(px + 90, viewH);
      ctx.fill();
    }

    // 2. World Coordinate Transform
    ctx.save();
    ctx.translate(-camX, -camY);

    // Platforms
    for (const p of engine.level.platforms) {
      if (p.isCollapsed || p.isVisible === false) continue;

      if (p.type === 'solid') {
        // Solid rock/temple platform
        ctx.fillStyle = p.color || '#162220';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Moss / Moonlight top line
        ctx.fillStyle = '#2f5e4f';
        ctx.fillRect(p.x, p.y, p.width, 5);

        // Highlight stroke
        ctx.strokeStyle = 'rgba(72, 202, 228, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      } else if (p.type === 'one-way') {
        // Wood / spirit bridge
        ctx.fillStyle = '#263a35';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = '#48cae4';
        ctx.fillRect(p.x, p.y, p.width, 3);
      } else if (p.type === 'moving') {
        // Bronze moving slab with glowing runes
        ctx.fillStyle = '#3a4b44';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = '#fca311';
        ctx.fillRect(p.x + 4, p.y + 2, p.width - 8, 3);
      } else if (p.type === 'collapsing') {
        // Cracking stone
        ctx.fillStyle = '#435450';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.strokeStyle = '#e63946';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      } else if (p.type === 'disappearing') {
        // Ethereal phase platform
        ctx.fillStyle = 'rgba(72, 202, 228, 0.35)';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.strokeStyle = '#48cae4';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      }
    }

    // Traps
    for (const t of engine.level.traps) {
      if (t.type === 'spikes') {
        // Spikes
        ctx.fillStyle = '#adb5bd';
        const spikeCount = Math.floor(t.width / 16);
        for (let i = 0; i < spikeCount; i++) {
          const sx = t.x + i * 16;
          ctx.beginPath();
          ctx.moveTo(sx, t.y + t.height);
          ctx.lineTo(sx + 8, t.y);
          ctx.lineTo(sx + 16, t.y + t.height);
          ctx.closePath();
          ctx.fill();
        }
      } else if (t.type === 'blade') {
        // Swinging chain & scythe
        const px = t.pivotX || t.x;
        const py = t.pivotY || t.y;

        // Chain
        ctx.strokeStyle = 'rgba(173, 181, 189, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(t.x + t.width / 2, t.y + t.height / 2);
        ctx.stroke();

        // Curved Blade Head
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(t.x + t.width / 2, t.y + t.height / 2, t.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f8f9fa';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (t.type === 'arrow_turret') {
        // Stone Turret
        ctx.fillStyle = '#343a40';
        ctx.fillRect(t.x, t.y, t.width, t.height);
        ctx.fillStyle = '#e63946';
        ctx.fillRect(t.x + 4, t.y + 10, t.width - 8, 8);
      }
    }

    // Checkpoints (Lantern Shrines)
    for (const cp of engine.level.checkpoints) {
      // Stone base
      ctx.fillStyle = '#212529';
      ctx.fillRect(cp.x + 8, cp.y + 40, cp.width - 16, cp.height - 40);
      // Shrine Roof
      ctx.fillStyle = '#343a40';
      ctx.beginPath();
      ctx.moveTo(cp.x - 4, cp.y + 20);
      ctx.lineTo(cp.x + cp.width / 2, cp.y + 8);
      ctx.lineTo(cp.x + cp.width + 4, cp.y + 20);
      ctx.closePath();
      ctx.fill();

      // Spirit Flame
      const flameColor = cp.activated ? '#5bc0be' : '#495057';
      ctx.fillStyle = flameColor;
      ctx.beginPath();
      ctx.arc(cp.x + cp.width / 2, cp.y + 28, cp.activated ? 8 : 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Finish Torii Spirit Gate
    const gate = engine.level.finishGate;
    // Pillars
    ctx.fillStyle = '#800e13';
    ctx.fillRect(gate.x, gate.y + 10, 10, gate.height - 10);
    ctx.fillRect(gate.x + gate.width - 10, gate.y + 10, 10, gate.height - 10);
    // Torii Crossbeams
    ctx.fillStyle = '#a61c1c';
    ctx.fillRect(gate.x - 8, gate.y + 10, gate.width + 16, 10);
    ctx.fillRect(gate.x - 4, gate.y + 24, gate.width + 8, 7);

    // Swirling Portal in Center
    const portalGrad = ctx.createRadialGradient(
      gate.x + gate.width / 2,
      gate.y + gate.height / 2,
      5,
      gate.x + gate.width / 2,
      gate.y + gate.height / 2,
      24
    );
    portalGrad.addColorStop(0, '#ffffff');
    portalGrad.addColorStop(0.5, '#48cae4');
    portalGrad.addColorStop(1, 'rgba(0, 119, 182, 0)');
    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.arc(gate.x + gate.width / 2, gate.y + gate.height / 2, 24, 0, Math.PI * 2);
    ctx.fill();

    // Collectibles
    for (const c of engine.level.collectibles) {
      if (c.collected) continue;

      const bob = Math.sin(Date.now() / 250 + c.x) * 4;

      if (c.type === 'shard') {
        // Rotating Diamond Shard
        ctx.fillStyle = '#48cae4';
        ctx.beginPath();
        ctx.moveTo(c.x + 10, c.y + bob);
        ctx.lineTo(c.x + 18, c.y + 10 + bob);
        ctx.lineTo(c.x + 10, c.y + 20 + bob);
        ctx.lineTo(c.x + 2, c.y + 10 + bob);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (c.type === 'moon_sigil') {
        // Golden Moon Amulet
        ctx.fillStyle = '#fca311';
        ctx.beginPath();
        ctx.arc(c.x + 10, c.y + 10 + bob, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#05070a';
        ctx.beginPath();
        ctx.arc(c.x + 14, c.y + 8 + bob, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'memory_fragment') {
        // Purple Ethereal Relic
        ctx.fillStyle = '#b5179e';
        ctx.beginPath();
        ctx.arc(c.x + 10, c.y + 10 + bob, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'health_pack') {
        // Red Health Lotus
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(c.x + 10, c.y + 10 + bob, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(c.x + 8, c.y + 5 + bob, 4, 10);
        ctx.fillRect(c.x + 5, c.y + 8 + bob, 10, 4);
      }
    }

    // Enemies
    for (const e of engine.level.enemies) {
      if (e.health <= 0) continue;

      ctx.save();
      ctx.translate(e.x + e.width / 2, e.y + e.height / 2);
      if (e.facing === 'left') ctx.scale(-1, 1);

      if (e.type === 'shadow_guard') {
        // Shadow Guard
        ctx.fillStyle = e.hurtTimer && e.hurtTimer > 0 ? '#ffffff' : '#1b222d';
        ctx.fillRect(-14, -22, 28, 44);

        // Red glowing eye slit
        ctx.fillStyle = '#e63946';
        ctx.fillRect(4, -14, 6, 3);

        // Blade
        ctx.fillStyle = '#adb5bd';
        ctx.fillRect(8, -4, 20, 4);
      } else if (e.type === 'raven_scout') {
        // Raven
        ctx.fillStyle = '#14181f';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        const wingY = Math.sin(Date.now() / 100) * 10;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-18, wingY);
        ctx.lineTo(0, -6);
        ctx.fill();
        // Red eye
        ctx.fillStyle = '#e63946';
        ctx.fillRect(6, -4, 4, 3);
      } else if (e.type === 'temple_monk') {
        // Monk
        ctx.fillStyle = '#3a241b';
        ctx.fillRect(-14, -22, 28, 44);
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(0, -14, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'iron_hunter') {
        // Armored Brute
        ctx.fillStyle = '#212529';
        ctx.fillRect(-18, -26, 36, 52);
        // Spiked shield in front
        ctx.fillStyle = '#495057';
        ctx.fillRect(10, -20, 10, 40);
        ctx.fillStyle = '#e63946';
        ctx.fillRect(2, -18, 5, 4);
      }

      ctx.restore();

      // Enemy Health Bar
      const enemyHpPct = Math.max(0, e.health / e.maxHealth);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(e.x - 2, e.y - 10, e.width + 4, 5);
      ctx.fillStyle = '#e63946';
      ctx.fillRect(e.x, e.y - 9, e.width * enemyHpPct, 3);
    }

    // Boss: Kage-no-Oni (The Shadow Revenant)
    if (engine.level.boss && engine.level.boss.health > 0) {
      const boss = engine.level.boss;
      ctx.save();
      ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);
      if (boss.facing === 'left') ctx.scale(-1, 1);

      // Dark aura
      const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 50);
      auraGrad.addColorStop(
        0,
        boss.phase === 2 ? 'rgba(230, 57, 70, 0.5)' : 'rgba(114, 9, 183, 0.45)'
      );
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fill();

      // Demon Samurai Body
      ctx.fillStyle = boss.state === 'stunned' ? '#48cae4' : '#14171d';
      ctx.fillRect(-22, -36, 44, 72);

      // Horns
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.moveTo(-16, -36);
      ctx.lineTo(-24, -52);
      ctx.lineTo(-10, -38);
      ctx.moveTo(10, -38);
      ctx.lineTo(24, -52);
      ctx.lineTo(16, -36);
      ctx.fill();

      // Flaming Eyes
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(4, -24, 7, 4);

      // Twin Flaming Katana
      ctx.fillStyle = boss.phase === 2 ? '#ff4d6d' : '#9d4edd';
      ctx.fillRect(16, -15, 34, 6);

      ctx.restore();
    }

    // Projectiles
    for (const p of engine.projectiles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Kairo (The Player Hero)
    const p = engine.player;
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    if (p.facing === 'left') ctx.scale(-1, 1);

    // Invulnerability Blink
    if (p.isInvulnerable && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // Hero Silhouette / Costume Color
    const suitColor =
      p.skin === 'skin_crimson'
        ? '#590d16'
        : p.skin === 'skin_wraith'
        ? '#0d2838'
        : p.skin === 'skin_golden'
        ? '#2e1c0c'
        : '#151922';

    const accentColor =
      p.skin === 'skin_crimson'
        ? '#ff4d6d'
        : p.skin === 'skin_wraith'
        ? '#00f5d4'
        : p.skin === 'skin_golden'
        ? '#ffd166'
        : '#48cae4';

    // Body
    ctx.fillStyle = suitColor;
    if (p.isCrouching) {
      ctx.fillRect(-12, -8, 24, 32);
    } else {
      ctx.fillRect(-12, -22, 24, 44);
    }

    // Flowing Scarf / Ribbon (Trails dynamically with velocity)
    const scarfFlutter = Math.sin(Date.now() / 120) * 8;
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(-24 - Math.abs(p.vx * 0.05), -12 + scarfFlutter);
    ctx.lineTo(-20 - Math.abs(p.vx * 0.04), -6 + scarfFlutter);
    ctx.lineTo(-8, -8);
    ctx.closePath();
    ctx.fill();

    // Visor Mask
    ctx.fillStyle = accentColor;
    ctx.fillRect(2, -16, 7, 3);

    // Katana Blade (extended during attack)
    if (p.isAttacking) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, -6, 28, 4);
      ctx.fillStyle = accentColor;
      ctx.fillRect(8, -7, 28, 2);
    }

    ctx.restore();

    // Particles
    for (const part of engine.particles.particles) {
      ctx.fillStyle = part.color;
      ctx.globalAlpha = Math.max(0, part.life / part.maxLife);
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // Restore world transform
    ctx.restore(); // Restore high DPI scale
  };

  const handleRestartCheckpoint = () => {
    setIsPaused(false);
    setIsGameOver(false);
    engineRef.current?.respawnAtCheckpoint();
  };

  const handleRestartLevel = () => {
    setIsPaused(false);
    setIsGameOver(false);
    if (engineRef.current) {
      engineRef.current = new GameEngine(level, playerStats, cosmetics, {
        onPlayerDeath: () => setIsGameOver(true),
        onLevelComplete: (stars, stats) => {
          setIsComplete(true);
          onLevelComplete(stars, stats);
        },
      });
    }
  };

  const engine = engineRef.current;
  if (!engine) return null;

  return (
    <View style={styles.container}>
      {/* Web Canvas Renderer */}
      {Platform.OS === 'web' && (
        <canvas
          ref={canvasRef as any}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          } as any}
        />
      )}

      {/* Native SVG Renderer Fallback */}
      {Platform.OS !== 'web' && (
        <Svg style={StyleSheet.absoluteFill}>
          <G transform={`translate(${-cameraRef.current.x}, ${-cameraRef.current.y})`}>
            {engine.level.platforms.map((p) =>
              p.isCollapsed || p.isVisible === false ? null : (
                <Rect
                  key={p.id}
                  x={p.x}
                  y={p.y}
                  width={p.width}
                  height={p.height}
                  fill={p.color || '#162220'}
                />
              )
            )}
            {engine.level.collectibles.map((c) =>
              c.collected ? null : (
                <Circle
                  key={c.id}
                  cx={c.x + 10}
                  cy={c.y + 10}
                  r={8}
                  fill={c.type === 'shard' ? '#48cae4' : '#fca311'}
                />
              )
            )}
            <Rect
              x={engine.level.finishGate.x}
              y={engine.level.finishGate.y}
              width={engine.level.finishGate.width}
              height={engine.level.finishGate.height}
              fill="#800e13"
            />
            {engine.level.enemies.map((e) =>
              e.health <= 0 ? null : (
                <Rect
                  key={e.id}
                  x={e.x}
                  y={e.y}
                  width={e.width}
                  height={e.height}
                  fill="#e63946"
                />
              )
            )}
            <Rect
              x={engine.player.x}
              y={engine.player.y}
              width={engine.player.width}
              height={engine.player.height}
              fill="#48cae4"
            />
          </G>
        </Svg>
      )}

      {/* Top HUD */}
      <HUD
        player={engine.player}
        levelTitle={level.title}
        levelNumber={level.levelNumber}
        shardsCount={engine.collectedShardsInLevel}
        score={Math.floor(engine.levelTime * 10 + engine.collectedShardsInLevel * 50)}
        boss={level.boss}
        onPause={() => setIsPaused(true)}
      />

      {/* On-Screen Touch Controls */}
      <VirtualControls
        config={touchConfig}
        onMoveLeftStart={() => {
          inputRef.current.moveDir = -1;
        }}
        onMoveLeftEnd={() => {
          if (inputRef.current.moveDir === -1) inputRef.current.moveDir = 0;
        }}
        onMoveRightStart={() => {
          inputRef.current.moveDir = 1;
        }}
        onMoveRightEnd={() => {
          if (inputRef.current.moveDir === 1) inputRef.current.moveDir = 0;
        }}
        onCrouchToggle={(crouch) => {
          inputRef.current.isCrouching = crouch;
          engine.handleCrouch(crouch);
        }}
        onJumpPress={() => engine.handleJumpPress()}
        onJumpRelease={() => engine.handleJumpRelease()}
        onAttack={() => engine.handleAttack()}
        onDash={() => engine.handleDash()}
        onSpecial={() => engine.handleSpecial()}
        dashReady={engine.player.dashCooldownTimer <= 0}
        specialReady={engine.player.energy >= 40}
      />

      {/* Pause Modal */}
      <PauseModal
        visible={isPaused}
        onResume={() => setIsPaused(false)}
        onRestartCheckpoint={handleRestartCheckpoint}
        onRestartLevel={handleRestartLevel}
        onSettings={() => {
          setIsPaused(false);
          onExit();
        }}
        onExit={onExit}
      />

      {/* Game Over Modal */}
      <GameOverModal
        visible={isGameOver}
        onRespawnCheckpoint={handleRestartCheckpoint}
        onRestartLevel={handleRestartLevel}
        onExit={onExit}
      />

      {/* Level Complete Modal */}
      <LevelCompleteModal
        visible={isComplete}
        levelTitle={level.title}
        levelNumber={level.levelNumber}
        stars={completionData.stars}
        timeSeconds={completionData.time}
        shardsEarned={completionData.shards}
        score={completionData.score}
        xpEarned={completionData.xp}
        onNextLevel={() => {
          setIsComplete(false);
          onNextLevel();
        }}
        onReplay={() => {
          setIsComplete(false);
          handleRestartLevel();
        }}
        onWorldMap={onExit}
        hasNextLevel={hasNextLevel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    overflow: 'hidden',
  },
});
