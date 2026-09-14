import {
  Collectible,
  Enemy,
  LevelData,
  Platform,
  PlayerState,
  PlayerStats,
  Projectile,
  Trap,
} from '../types/game';
import { PHYSICS } from '../constants/physics';
import { ParticleSystem } from './ParticleSystem';
import { EnemyAI } from './EnemyAI';
import { BossAI } from './BossAI';
import { audio } from '../services/audioService';

export interface GameEngineCallbacks {
  onCollectShard?: (count: number) => void;
  onCollectSigil?: () => void;
  onCollectMemoryFragment?: () => void;
  onPlayerDeath?: () => void;
  onPlayerCheckpoint?: (id: string) => void;
  onEnemyKilled?: (enemy: Enemy) => void;
  onBossDefeated?: () => void;
  onLevelComplete?: (stars: number, stats: { time: number; shards: number; score: number }) => void;
}

export class GameEngine {
  public level: LevelData;
  public player: PlayerState;
  public stats: PlayerStats;
  public particles: ParticleSystem;
  public projectiles: Projectile[] = [];

  public levelTime: number = 0;
  public collectedShardsInLevel: number = 0;
  public enemiesKilledCount: number = 0;
  public lastCheckpointX: number;
  public lastCheckpointY: number;

  private callbacks: GameEngineCallbacks;
  private prevPlayerY: number;

  constructor(
    level: LevelData,
    stats: PlayerStats,
    cosmetics: { skin: string; trail: string },
    callbacks: GameEngineCallbacks = {}
  ) {
    this.level = JSON.parse(JSON.stringify(level)); // Deep copy so resets work cleanly
    this.stats = stats;
    this.callbacks = callbacks;
    this.particles = new ParticleSystem();

    this.lastCheckpointX = this.level.startX;
    this.lastCheckpointY = this.level.startY;
    this.prevPlayerY = this.level.startY;

    this.player = {
      x: this.level.startX,
      y: this.level.startY,
      vx: 0,
      vy: 0,
      width: 28,
      height: 48,
      facing: 'right',
      isGrounded: false,
      isWallSliding: false,
      wallDirection: 1,
      isDashing: false,
      dashCooldownTimer: 0,
      dashTimer: 0,
      isAttacking: false,
      attackTimer: 0,
      attackCombo: 1,
      isCrouching: false,
      isInvulnerable: false,
      invulnerableTimer: 0,
      health: stats.maxHealth,
      maxHealth: stats.maxHealth,
      energy: 100,
      maxEnergy: 100,
      canDoubleJump: stats.hasDoubleJump,
      isDead: false,
      isVictorious: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      skin: cosmetics.skin,
      trail: cosmetics.trail,
    };
  }

  // --- Input Actions ---

  public handleMove(horizontal: number) {
    if (this.player.isDead || this.player.isVictorious) return;
    if (this.player.isDashing) return;

    if (horizontal > 0.1) {
      this.player.facing = 'right';
      this.player.vx = Math.min(
        PHYSICS.MOVE_SPEED,
        this.player.vx + PHYSICS.ACCELERATION * 0.016
      );
    } else if (horizontal < -0.1) {
      this.player.facing = 'left';
      this.player.vx = Math.max(
        -PHYSICS.MOVE_SPEED,
        this.player.vx - PHYSICS.ACCELERATION * 0.016
      );
    } else {
      // Deceleration / friction
      this.player.vx *= PHYSICS.FRICTION;
      if (Math.abs(this.player.vx) < 10) this.player.vx = 0;
    }
  }

  public handleCrouch(isCrouching: boolean) {
    if (this.player.isDead || this.player.isVictorious) return;
    this.player.isCrouching = isCrouching;
  }

  public handleJumpPress() {
    if (this.player.isDead || this.player.isVictorious) return;

    // Check if dropping through a one-way platform
    if (this.player.isCrouching && this.player.isGrounded) {
      this.player.y += 6; // Drop down below platform edge
      this.player.isGrounded = false;
      return;
    }

    // Wall Jump
    if (this.player.isWallSliding) {
      this.player.vy = PHYSICS.WALL_JUMP_IMPULSE_Y;
      this.player.vx = -this.player.wallDirection * PHYSICS.WALL_JUMP_IMPULSE_X;
      this.player.facing = this.player.wallDirection === 1 ? 'left' : 'right';
      this.player.isWallSliding = false;
      audio.playJump();
      this.particles.emitDust(this.player.x + 14, this.player.y + 30, 8);
      return;
    }

    // Ground or Coyote Jump
    if (this.player.isGrounded || this.player.coyoteTimer > 0) {
      this.player.vy = PHYSICS.JUMP_FORCE;
      this.player.isGrounded = false;
      this.player.coyoteTimer = 0;
      audio.playJump();
      this.particles.emitDust(this.player.x + 14, this.player.y + 45, 6);
      return;
    }

    // Double Jump (if unlocked and available)
    if (this.stats.hasDoubleJump && this.player.canDoubleJump) {
      this.player.vy = PHYSICS.DOUBLE_JUMP_FORCE;
      this.player.canDoubleJump = false;
      audio.playDoubleJump();
      this.particles.emitSlashArc(this.player.x + 14, this.player.y + 35, this.player.facing, '#ffd166');
      return;
    }

    // Jump Buffer
    this.player.jumpBufferTimer = PHYSICS.JUMP_BUFFER_TIME;
  }

  public handleJumpRelease() {
    // Variable jump height: cut vertical velocity if releasing jump early
    if (this.player.vy < -150) {
      this.player.vy *= 0.55;
    }
  }

  public handleDash() {
    if (
      this.player.isDead ||
      this.player.isVictorious ||
      this.player.isDashing ||
      this.player.dashCooldownTimer > 0
    ) {
      return;
    }

    this.player.isDashing = true;
    this.player.dashTimer = PHYSICS.DASH_DURATION;
    this.player.dashCooldownTimer = this.stats.dashCooldown;
    this.player.isInvulnerable = true;
    this.player.invulnerableTimer = PHYSICS.DASH_DURATION + 0.1;

    const dir = this.player.facing === 'right' ? 1 : -1;
    this.player.vx = dir * this.stats.dashSpeed;
    this.player.vy = 0; // maintain horizontal glide during dash

    audio.playDash();
    this.particles.emitDashTrail(
      this.player.x + 14,
      this.player.y + 24,
      this.player.trail === 'trail_sakura'
        ? '#ff4d6d'
        : this.player.trail === 'trail_lightning'
        ? '#48cae4'
        : '#495057',
      this.player.facing
    );
  }

  public handleAttack() {
    if (this.player.isDead || this.player.isVictorious || this.player.isAttacking) return;

    this.player.isAttacking = true;
    this.player.attackTimer = PHYSICS.ATTACK_DURATION;
    this.player.attackCombo = (this.player.attackCombo % 3) + 1;

    audio.playSlash();
    this.particles.emitSlashArc(
      this.player.x + (this.player.facing === 'right' ? 30 : -10),
      this.player.y + 24,
      this.player.facing,
      this.player.skin === 'skin_crimson' ? '#ff4d6d' : '#48cae4'
    );

    // Hit detection against enemies
    const attackReach = PHYSICS.ATTACK_RANGE;
    const hitBox = {
      x: this.player.facing === 'right' ? this.player.x + 10 : this.player.x - attackReach,
      y: this.player.y - 10,
      width: attackReach + 20,
      height: this.player.height + 20,
    };

    const baseDamage = 22 * this.stats.damageMultiplier;

    // Check against standard enemies
    for (const enemy of this.level.enemies) {
      if (enemy.health <= 0) continue;

      const collides =
        hitBox.x < enemy.x + enemy.width &&
        hitBox.x + hitBox.width > enemy.x &&
        hitBox.y < enemy.y + enemy.height &&
        hitBox.y + hitBox.height > enemy.y;

      if (collides) {
        // Shielded enemies like Iron Hunter block attacks from front
        if (enemy.shieldFront && enemy.facing !== this.player.facing) {
          audio.playHit();
          this.particles.emitHitSparks(enemy.x + 15, enemy.y + 25, 10, '#adb5bd');
          continue;
        }

        enemy.health -= baseDamage;
        enemy.hurtTimer = 0.2;
        audio.playHit();
        this.particles.emitBloodBurst(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 8);

        // Knockback
        const dir = this.player.facing === 'right' ? 1 : -1;
        enemy.vx = dir * 140;

        if (enemy.health <= 0) {
          enemy.state = 'dead';
          audio.playEnemyDeath();
          this.enemiesKilledCount++;
          if (this.callbacks.onEnemyKilled) this.callbacks.onEnemyKilled(enemy);
        }
      }
    }

    // Check against Boss if present
    if (this.level.boss && this.level.boss.health > 0) {
      const boss = this.level.boss;
      const collides =
        hitBox.x < boss.x + boss.width &&
        hitBox.x + hitBox.width > boss.x &&
        hitBox.y < boss.y + boss.height &&
        hitBox.y + hitBox.height > boss.y;

      if (collides) {
        const bossDmg = boss.vulnerable ? baseDamage * 1.5 : baseDamage * 0.8;
        boss.health -= bossDmg;
        audio.playHit();
        this.particles.emitHitSparks(boss.x + 25, boss.y + 35, 14, '#ffd166');

        if (boss.health <= 0) {
          boss.health = 0;
          boss.state = 'defeated';
          if (this.callbacks.onBossDefeated) this.callbacks.onBossDefeated();
        }
      }
    }
  }

  public handleSpecial() {
    if (
      this.player.isDead ||
      this.player.isVictorious ||
      this.player.energy < PHYSICS.SPECIAL_COST
    ) {
      return;
    }

    this.player.energy -= PHYSICS.SPECIAL_COST;
    audio.playSpecial();

    const dir = this.player.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: Math.random().toString(),
      x: this.player.x + (dir === 1 ? this.player.width + 10 : -10),
      y: this.player.y + 20,
      vx: dir * PHYSICS.SPECIAL_SPEED,
      vy: 0,
      radius: 12,
      damage: this.stats.specialDamage,
      fromPlayer: true,
      life: PHYSICS.SPECIAL_LIFETIME,
      maxLife: PHYSICS.SPECIAL_LIFETIME,
      color: '#48cae4',
      type: 'shuriken',
    });

    this.particles.emitSlashArc(
      this.player.x + 14,
      this.player.y + 20,
      this.player.facing,
      '#5bc0be'
    );
  }

  // --- Main 60 FPS Game Loop Tick ---

  public update(dt: number) {
    if (this.player.isDead) return;

    this.levelTime += dt;
    this.prevPlayerY = this.player.y;

    // Energy regeneration
    if (this.player.energy < this.player.maxEnergy) {
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 12 * dt);
    }

    // Cooldown timers
    if (this.player.dashCooldownTimer > 0) {
      this.player.dashCooldownTimer -= dt;
    }
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
      if (this.player.invulnerableTimer <= 0) this.player.isInvulnerable = false;
    }
    if (this.player.attackTimer > 0) {
      this.player.attackTimer -= dt;
      if (this.player.attackTimer <= 0) this.player.isAttacking = false;
    }
    if (this.player.coyoteTimer > 0) {
      this.player.coyoteTimer -= dt;
    }
    if (this.player.jumpBufferTimer > 0) {
      this.player.jumpBufferTimer -= dt;
      if (this.player.isGrounded) {
        this.handleJumpPress();
        this.player.jumpBufferTimer = 0;
      }
    }

    // Dash update
    if (this.player.isDashing) {
      this.player.dashTimer -= dt;
      this.particles.emitDashTrail(
        this.player.x + 14,
        this.player.y + 24,
        '#48cae4',
        this.player.facing
      );
      if (this.player.dashTimer <= 0) {
        this.player.isDashing = false;
      }
    } else {
      // Apply Gravity
      if (!this.player.isGrounded) {
        if (this.player.isWallSliding) {
          this.player.vy = Math.min(PHYSICS.WALL_SLIDE_SPEED, this.player.vy + PHYSICS.GRAVITY * dt * 0.3);
        } else {
          this.player.vy = Math.min(PHYSICS.MAX_FALL_SPEED, this.player.vy + PHYSICS.GRAVITY * dt);
        }
      }
    }

    // Update moving / collapsing / disappearing platforms
    this.updatePlatforms(dt);

    // Apply movement & collisions
    this.applyPlayerMovement(dt);

    // Update Traps
    this.updateTraps(dt);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Enemies & Boss
    this.updateEntities(dt);

    // Update Collectibles
    this.updateCollectibles();

    // Update Checkpoints & Finish Gate
    this.updateCheckpointsAndGate();

    // Check Bottomless Pit
    if (this.player.y > this.level.height + 60) {
      this.damagePlayer(100, 'Bottomless Abyss');
    }

    // Update Particles
    this.particles.update(dt);
  }

  // --- Platform Logic ---

  private updatePlatforms(dt: number) {
    for (const p of this.level.platforms) {
      if (p.type === 'moving') {
        if (p.startX !== undefined && p.endX !== undefined && p.speed) {
          p.x += (p.direction || 1) * p.speed * dt;
          if (p.x <= p.startX) {
            p.x = p.startX;
            p.direction = 1;
          } else if (p.x + p.width >= p.endX) {
            p.x = p.endX - p.width;
            p.direction = -1;
          }
        }
        if (p.startY !== undefined && p.endY !== undefined && p.speed) {
          p.y += (p.direction || 1) * p.speed * dt;
          if (p.y <= p.startY) {
            p.y = p.startY;
            p.direction = 1;
          } else if (p.y + p.height >= p.endY) {
            p.y = p.endY - p.height;
            p.direction = -1;
          }
        }
      } else if (p.type === 'collapsing') {
        if (p.collapseTimer !== undefined && p.collapseTimer > 0) {
          p.collapseTimer -= dt;
          if (p.collapseTimer <= 0) {
            p.isCollapsed = true;
            p.regenTimer = 3.0; // reappear in 3s
            this.particles.emitDust(p.x + p.width / 2, p.y + p.height / 2, 10);
          }
        } else if (p.isCollapsed && p.regenTimer !== undefined) {
          p.regenTimer -= dt;
          if (p.regenTimer <= 0) {
            p.isCollapsed = false;
            p.collapseTimer = undefined;
          }
        }
      } else if (p.type === 'disappearing') {
        p.phaseTimer = (p.phaseTimer || 0) + dt;
        const duration = p.phaseDuration || 2.0;
        p.isVisible = Math.floor(p.phaseTimer / duration) % 2 === 0;
      }
    }
  }

  private applyPlayerMovement(dt: number) {
    // 1. Horizontal Movement
    this.player.x += this.player.vx * dt;

    // Boundaries
    if (this.player.x < 0) {
      this.player.x = 0;
      this.player.vx = 0;
    } else if (this.player.x + this.player.width > this.level.width) {
      this.player.x = this.level.width - this.player.width;
      this.player.vx = 0;
    }

    // Horizontal Collisions with Solid Platforms
    this.player.isWallSliding = false;
    for (const p of this.level.platforms) {
      if (p.type !== 'solid') continue;

      const collidesX =
        this.player.x < p.x + p.width &&
        this.player.x + this.player.width > p.x &&
        this.player.y < p.y + p.height &&
        this.player.y + this.player.height > p.y;

      if (collidesX) {
        if (this.player.vx > 0) {
          this.player.x = p.x - this.player.width;
          this.player.vx = 0;
          // Wall slide check
          if (!this.player.isGrounded && this.player.vy > 0) {
            this.player.isWallSliding = true;
            this.player.wallDirection = 1;
          }
        } else if (this.player.vx < 0) {
          this.player.x = p.x + p.width;
          this.player.vx = 0;
          if (!this.player.isGrounded && this.player.vy > 0) {
            this.player.isWallSliding = true;
            this.player.wallDirection = -1;
          }
        }
      }
    }

    // 2. Vertical Movement
    this.player.y += this.player.vy * dt;
    const wasGrounded = this.player.isGrounded;
    this.player.isGrounded = false;

    // Vertical Collisions
    for (const p of this.level.platforms) {
      if (p.isCollapsed || p.isVisible === false) continue;

      const horizOverlap =
        this.player.x + this.player.width - 4 > p.x &&
        this.player.x + 4 < p.x + p.width;

      if (!horizOverlap) continue;

      if (p.type === 'solid') {
        const collidesY =
          this.player.y < p.y + p.height &&
          this.player.y + this.player.height > p.y;

        if (collidesY) {
          if (this.player.vy >= 0) {
            // Landing on top
            this.player.y = p.y - this.player.height;
            this.player.vy = 0;
            this.player.isGrounded = true;
            this.player.canDoubleJump = this.stats.hasDoubleJump;
            if (!wasGrounded) {
              this.particles.emitDust(this.player.x + 14, this.player.y + 45, 4);
            }
          } else if (this.player.vy < 0) {
            // Hitting ceiling
            this.player.y = p.y + p.height;
            this.player.vy = 0;
          }
        }
      } else if (p.type === 'one-way' || p.type === 'moving' || p.type === 'collapsing') {
        // One-way landing condition: previously above platform top and falling
        const prevBottom = this.prevPlayerY + this.player.height;
        const currentBottom = this.player.y + this.player.height;

        if (prevBottom <= p.y + 8 && currentBottom >= p.y && this.player.vy >= 0) {
          this.player.y = p.y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.canDoubleJump = this.stats.hasDoubleJump;

          // If moving platform, carry player along
          if (p.type === 'moving' && p.speed) {
            if (p.startX !== undefined) {
              this.player.x += (p.direction || 1) * p.speed * dt;
            }
          }

          // If collapsing, initiate countdown
          if (p.type === 'collapsing' && p.collapseTimer === undefined) {
            p.collapseTimer = 0.8;
          }
        }
      }
    }

    // Coyote time trigger when walking off edge
    if (wasGrounded && !this.player.isGrounded && this.player.vy >= 0) {
      this.player.coyoteTimer = PHYSICS.COYOTE_TIME;
    }
  }

  // --- Traps Logic ---

  private updateTraps(dt: number) {
    for (const trap of this.level.traps) {
      if (trap.type === 'spikes') {
        const hit =
          this.player.x + 6 < trap.x + trap.width &&
          this.player.x + this.player.width - 6 > trap.x &&
          this.player.y + 6 < trap.y + trap.height &&
          this.player.y + this.player.height > trap.y + 4;

        if (hit && !this.player.isInvulnerable) {
          this.damagePlayer(trap.damage, 'Spikes');
          this.player.vy = -320; // knock up
        }
      } else if (trap.type === 'blade') {
        // Pendulum blade arc motion
        trap.angle = (trap.angle || 0) + (trap.speed || 2.0) * dt;
        const currentAngle = Math.sin(trap.angle) * 1.3;
        const bladeX = (trap.pivotX || trap.x) + Math.sin(currentAngle) * (trap.radius || 100);
        const bladeY = (trap.pivotY || trap.y) + Math.cos(currentAngle) * (trap.radius || 100);
        trap.x = bladeX - trap.width / 2;
        trap.y = bladeY - trap.height / 2;

        const hit =
          this.player.x < trap.x + trap.width &&
          this.player.x + this.player.width > trap.x &&
          this.player.y < trap.y + trap.height &&
          this.player.y + this.player.height > trap.y;

        if (hit && !this.player.isInvulnerable && !this.player.isDashing) {
          this.damagePlayer(trap.damage, 'Swinging Blade');
          this.player.vx = this.player.facing === 'right' ? -200 : 200;
        }
      } else if (trap.type === 'arrow_turret') {
        trap.cooldown = (trap.cooldown || 0) - dt;
        if (trap.cooldown <= 0) {
          trap.cooldown = trap.fireRate || 2.0;
          const dir = trap.direction === 'right' ? 1 : -1;
          this.projectiles.push({
            id: Math.random().toString(),
            x: trap.x + (dir === 1 ? trap.width + 5 : -5),
            y: trap.y + trap.height / 2,
            vx: dir * 320,
            vy: 0,
            radius: 5,
            damage: trap.damage,
            fromPlayer: false,
            life: 2.5,
            maxLife: 2.5,
            color: '#adb5bd',
            type: 'dart',
          });
          this.particles.emitDust(trap.x, trap.y, 3);
        }
      }
    }
  }

  // --- Projectiles Update ---

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Check hit against player
      if (!p.fromPlayer) {
        const hitPlayer =
          p.x > this.player.x &&
          p.x < this.player.x + this.player.width &&
          p.y > this.player.y &&
          p.y < this.player.y + this.player.height;

        if (hitPlayer && !this.player.isInvulnerable && !this.player.isDashing) {
          this.damagePlayer(p.damage, 'Enemy Projectile');
          this.particles.emitHitSparks(p.x, p.y, 8, p.color);
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Player projectile hits enemies
        let hitEnemy = false;
        for (const enemy of this.level.enemies) {
          if (enemy.health <= 0) continue;
          if (
            p.x > enemy.x &&
            p.x < enemy.x + enemy.width &&
            p.y > enemy.y &&
            p.y < enemy.y + enemy.height
          ) {
            enemy.health -= p.damage;
            enemy.hurtTimer = 0.2;
            audio.playHit();
            this.particles.emitHitSparks(p.x, p.y, 10, '#48cae4');
            hitEnemy = true;
            if (enemy.health <= 0) {
              enemy.state = 'dead';
              audio.playEnemyDeath();
              this.enemiesKilledCount++;
              if (this.callbacks.onEnemyKilled) this.callbacks.onEnemyKilled(enemy);
            }
            break;
          }
        }

        // Check boss hit
        if (this.level.boss && this.level.boss.health > 0) {
          const boss = this.level.boss;
          if (
            p.x > boss.x &&
            p.x < boss.x + boss.width &&
            p.y > boss.y &&
            p.y < boss.y + boss.height
          ) {
            boss.health -= p.damage;
            audio.playHit();
            this.particles.emitHitSparks(p.x, p.y, 14, '#ffd166');
            hitEnemy = true;
            if (boss.health <= 0) {
              boss.health = 0;
              boss.state = 'defeated';
              if (this.callbacks.onBossDefeated) this.callbacks.onBossDefeated();
            }
          }
        }

        if (hitEnemy) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // --- Entities Update ---

  private updateEntities(dt: number) {
    // Standard Enemies
    const enemyRes = EnemyAI.updateEnemies(
      this.level.enemies,
      this.player,
      dt,
      this.projectiles,
      this.particles
    );
    if (enemyRes.playerDamage > 0) {
      this.damagePlayer(enemyRes.playerDamage, enemyRes.hitSource || 'Corrupted Shadow');
    }

    // Boss
    if (this.level.boss) {
      const bossRes = BossAI.updateBoss(
        this.level.boss,
        this.player,
        dt,
        this.projectiles,
        this.particles
      );
      if (bossRes.playerDamage > 0) {
        this.damagePlayer(bossRes.playerDamage, bossRes.hitSource || 'Boss Attack');
      }
    }
  }

  // --- Collectibles ---

  private updateCollectibles() {
    for (const c of this.level.collectibles) {
      if (c.collected) continue;

      const collides =
        this.player.x < c.x + 20 &&
        this.player.x + this.player.width > c.x &&
        this.player.y < c.y + 20 &&
        this.player.y + this.player.height > c.y;

      if (collides) {
        c.collected = true;

        if (c.type === 'shard') {
          audio.playShard();
          this.collectedShardsInLevel += 1;
          this.particles.emitShardSparkle(c.x + 10, c.y + 10, 8);
          if (this.callbacks.onCollectShard) this.callbacks.onCollectShard(1);
        } else if (c.type === 'moon_sigil') {
          audio.playMoonSigil();
          this.particles.emitHitSparks(c.x + 10, c.y + 10, 16, '#ffd166');
          if (this.callbacks.onCollectSigil) this.callbacks.onCollectSigil();
        } else if (c.type === 'memory_fragment') {
          audio.playMoonSigil();
          this.particles.emitHitSparks(c.x + 10, c.y + 10, 16, '#48cae4');
          if (this.callbacks.onCollectMemoryFragment) this.callbacks.onCollectMemoryFragment();
        } else if (c.type === 'health_pack') {
          audio.playShard();
          this.player.health = Math.min(this.player.maxHealth, this.player.health + 35);
          this.particles.emitHitSparks(c.x + 10, c.y + 10, 10, '#5bc0be');
        }
      }
    }
  }

  // --- Checkpoints and Torii Gate ---

  private updateCheckpointsAndGate() {
    // Checkpoints
    for (const cp of this.level.checkpoints) {
      if (cp.activated) continue;

      const collides =
        this.player.x < cp.x + cp.width &&
        this.player.x + this.player.width > cp.x &&
        this.player.y < cp.y + cp.height &&
        this.player.y + this.player.height > cp.y;

      if (collides) {
        cp.activated = true;
        this.lastCheckpointX = cp.x + 4;
        this.lastCheckpointY = cp.y + 10;
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
        audio.playCheckpoint();
        this.particles.emitLanternFlames(cp.x + cp.width / 2, cp.y + 20, 18);
        if (this.callbacks.onPlayerCheckpoint) this.callbacks.onPlayerCheckpoint(cp.id);
      }
    }

    // Finish Torii Spirit Gate
    const gate = this.level.finishGate;
    const collidesGate =
      this.player.x < gate.x + gate.width &&
      this.player.x + this.player.width > gate.x &&
      this.player.y < gate.y + gate.height &&
      this.player.y + this.player.height > gate.y;

    // In Level 1-5, boss must be defeated first
    const canComplete = !this.level.boss || this.level.boss.health <= 0;

    if (collidesGate && canComplete && !this.player.isVictorious) {
      this.player.isVictorious = true;
      audio.playVictory();
      this.particles.emitHitSparks(gate.x + 30, gate.y + 40, 24, '#48cae4');

      // Star calculation:
      // Star 1: Complete level
      // Star 2: Complete within par time OR defeat all enemies
      // Star 3: Gather at least 80% target shards without dying
      let stars = 1;
      if (this.levelTime <= this.level.parTime) stars++;
      if (this.collectedShardsInLevel >= Math.floor(this.level.targetShards * 0.75)) stars++;
      stars = Math.min(3, Math.max(1, stars));

      const score = Math.floor(
        stars * 1000 +
        this.collectedShardsInLevel * 50 +
        this.enemiesKilledCount * 100 +
        Math.max(0, (this.level.parTime - this.levelTime) * 20)
      );

      if (this.callbacks.onLevelComplete) {
        this.callbacks.onLevelComplete(stars, {
          time: Math.round(this.levelTime),
          shards: this.collectedShardsInLevel,
          score,
        });
      }
    }
  }

  // --- Player Damage & Respawn ---

  public damagePlayer(amount: number, source: string) {
    if (this.player.isInvulnerable || this.player.isDead) return;

    this.player.health -= amount;
    this.player.isInvulnerable = true;
    this.player.invulnerableTimer = PHYSICS.INVULNERABLE_DURATION;
    audio.playHurt();
    this.particles.emitBloodBurst(this.player.x + 14, this.player.y + 24, 12);

    if (this.player.health <= 0) {
      this.player.health = 0;
      this.player.isDead = true;
      audio.playGameOver();
      if (this.callbacks.onPlayerDeath) this.callbacks.onPlayerDeath();
    }
  }

  public respawnAtCheckpoint() {
    this.player.x = this.lastCheckpointX;
    this.player.y = this.lastCheckpointY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.health = this.player.maxHealth;
    this.player.energy = this.player.maxEnergy;
    this.player.isDead = false;
    this.player.isInvulnerable = true;
    this.player.invulnerableTimer = 1.5;
    this.particles.clear();
  }
}
