export interface Vector2D {
  x: number;
  y: number;
}

export type EnemyType =
  | 'shadow_guard'
  | 'raven_scout'
  | 'temple_monk'
  | 'iron_hunter'
  | 'phantom'
  | 'fortress_sentinel';

export type TrapType =
  | 'spikes'
  | 'blade'
  | 'arrow_turret'
  | 'falling_rock'
  | 'fire_vent';

export type PlatformType =
  | 'solid'
  | 'one-way'
  | 'moving'
  | 'collapsing'
  | 'disappearing';

export type CollectibleType =
  | 'shard'
  | 'moon_sigil'
  | 'memory_fragment'
  | 'xp_orb'
  | 'health_pack';

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  color?: string;
  // Moving platform properties
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  speed?: number;
  direction?: number;
  // Collapsing platform properties
  collapseTimer?: number;
  isCollapsed?: boolean;
  regenTimer?: number;
  // Disappearing platform properties
  phaseTimer?: number;
  isVisible?: boolean;
  phaseDuration?: number;
}

export interface Trap {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: TrapType;
  damage: number;
  // Pendulum blade properties
  pivotX?: number;
  pivotY?: number;
  radius?: number;
  angle?: number;
  speed?: number;
  // Turret / Projectile properties
  fireRate?: number;
  cooldown?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  // Falling rock properties
  triggered?: boolean;
  falling?: boolean;
  initialY?: number;
  vy?: number;
  // Fire vent properties
  isActive?: boolean;
  cycleTimer?: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: CollectibleType;
  value: number;
  collected: boolean;
  hoverOffset?: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  damage: number;
  facing: 'left' | 'right';
  state: 'patrol' | 'alert' | 'chase' | 'attack' | 'hurt' | 'dead';
  attackCooldown: number;
  patrolMinX: number;
  patrolMaxX: number;
  shieldFront?: boolean;
  shootCooldown?: number;
  teleportCooldown?: number;
  hurtTimer?: number;
  name: string;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  phase: number;
  state: 'intro' | 'idle' | 'slash_combo' | 'shadow_dash' | 'spike_summon' | 'clone_burst' | 'stunned' | 'defeated';
  timer: number;
  facing: 'left' | 'right';
  vulnerable: boolean;
  arenaLeft: number;
  arenaRight: number;
  telegraphTimer?: number;
  stunTimer?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  fromPlayer: boolean;
  life: number;
  maxLife: number;
  color: string;
  type: 'shuriken' | 'feather' | 'spirit_orb' | 'dart' | 'shadow_wave' | 'boss_spike';
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape?: 'circle' | 'line' | 'spark' | 'smoke' | 'petal';
  alpha?: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  activated: boolean;
  glowIntensity?: number;
}

export interface FinishGate {
  x: number;
  y: number;
  width: number;
  height: number;
  activated: boolean;
}

export interface LevelData {
  id: string;
  worldId: number;
  levelNumber: number;
  title: string;
  subtitle: string;
  description: string;
  width: number;
  height: number;
  startX: number;
  startY: number;
  parTime: number; // in seconds
  targetShards: number;
  platforms: Platform[];
  traps: Trap[];
  enemies: Enemy[];
  collectibles: Collectible[];
  checkpoints: Checkpoint[];
  finishGate: FinishGate;
  boss?: Boss;
  loreFragment?: string;
  atmosphereColor?: string;
}

export interface PlayerStats {
  maxHealth: number;
  damageMultiplier: number;
  dashCooldown: number;
  dashSpeed: number;
  hasDoubleJump: boolean;
  specialDamage: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isWallSliding: boolean;
  wallDirection: -1 | 1; // -1 wall on left, 1 wall on right
  isDashing: boolean;
  dashCooldownTimer: number;
  dashTimer: number;
  isAttacking: boolean;
  attackTimer: number;
  attackCombo: number; // 1, 2, 3
  isCrouching: boolean;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  canDoubleJump: boolean;
  isDead: boolean;
  isVictorious: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  skin: string;
  trail: string;
}

export interface TouchControlsConfig {
  size: 'small' | 'medium' | 'large';
  opacity: number;
  layout: 'classic' | 'compact' | 'spread';
}
