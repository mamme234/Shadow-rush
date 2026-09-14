import { Enemy, PlayerState, Projectile } from '../types/game';
import { ParticleSystem } from './ParticleSystem';
import { audio } from '../services/audioService';

export class EnemyAI {
  public static updateEnemies(
    enemies: Enemy[],
    player: PlayerState,
    dt: number,
    projectiles: Projectile[],
    particles: ParticleSystem
  ): { playerDamage: number; hitSource?: string } {
    let playerDamage = 0;
    let hitSource: string | undefined;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.health <= 0) {
        e.state = 'dead';
        continue;
      }

      // Hurt cooldown recovery
      if (e.hurtTimer && e.hurtTimer > 0) {
        e.hurtTimer -= dt;
        if (e.hurtTimer <= 0) e.hurtTimer = 0;
      }

      // Attack cooldown timer
      if (e.attackCooldown > 0) {
        e.attackCooldown -= dt;
      }

      // Distance to player
      const dx = (player.x + player.width / 2) - (e.x + e.width / 2);
      const dy = (player.y + player.height / 2) - (e.y + e.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      switch (e.type) {
        // ------------------------------------
        // 1. SHADOW GUARD (Patrol & Melee charge)
        // ------------------------------------
        case 'shadow_guard': {
          const isFacingPlayer = (e.facing === 'right' && dx > 0) || (e.facing === 'left' && dx < 0);
          const canSeePlayer = Math.abs(dy) < 80 && Math.abs(dx) < 220 && isFacingPlayer;

          if (canSeePlayer) {
            e.state = 'chase';
            e.facing = dx > 0 ? 'right' : 'left';
            const chaseSpeed = 95;
            e.vx = e.facing === 'right' ? chaseSpeed : -chaseSpeed;

            // Attack trigger when close
            if (dist < 50 && e.attackCooldown <= 0) {
              e.attackCooldown = 1.4;
              // Deal damage to player if player not invulnerable or dashing
              if (!player.isInvulnerable && !player.isDashing) {
                playerDamage += e.damage;
                hitSource = 'Shadow Guard Blade';
                particles.emitBloodBurst(player.x + 15, player.y + 20, 6);
                audio.playHit();
              }
            }
          } else {
            // Regular patrol
            e.state = 'patrol';
            const patrolSpeed = 45;
            if (e.x <= e.patrolMinX) {
              e.vx = patrolSpeed;
              e.facing = 'right';
            } else if (e.x + e.width >= e.patrolMaxX) {
              e.vx = -patrolSpeed;
              e.facing = 'left';
            }
            if (e.vx === 0) e.vx = e.facing === 'right' ? patrolSpeed : -patrolSpeed;
          }

          e.x += e.vx * dt;
          break;
        }

        // ------------------------------------
        // 2. RAVEN SCOUT (Flying, swooping & ranged feather attack)
        // ------------------------------------
        case 'raven_scout': {
          // Swoop motion (sinusoidal flight)
          e.x += e.vx * dt;
          e.y += Math.sin(Date.now() / 300) * 45 * dt;

          if (e.x <= e.patrolMinX) {
            e.vx = Math.abs(e.vx);
            e.facing = 'right';
          } else if (e.x + e.width >= e.patrolMaxX) {
            e.vx = -Math.abs(e.vx);
            e.facing = 'left';
          }

          // Dive / Drop feather projectile if above player
          if (Math.abs(dx) < 90 && dy > 0 && dy < 220 && e.attackCooldown <= 0) {
            e.attackCooldown = 2.2;
            projectiles.push({
              id: Math.random().toString(),
              x: e.x + e.width / 2,
              y: e.y + e.height,
              vx: (dx / dist) * 120,
              vy: 180,
              radius: 6,
              damage: e.damage,
              fromPlayer: false,
              life: 2.0,
              maxLife: 2.0,
              color: '#343a40',
              type: 'feather',
            });
            particles.emitDust(e.x + 15, e.y + 15, 4);
          }

          // Contact damage
          if (dist < 32 && !player.isInvulnerable && !player.isDashing) {
            playerDamage += e.damage;
            hitSource = 'Raven Scout Claws';
            audio.playHit();
          }
          break;
        }

        // ------------------------------------
        // 3. TEMPLE MONK (Ranged spirit orbs)
        // ------------------------------------
        case 'temple_monk': {
          e.facing = dx > 0 ? 'right' : 'left';
          if (e.shootCooldown !== undefined) {
            e.shootCooldown -= dt;
            if (e.shootCooldown <= 0 && dist < 320) {
              e.shootCooldown = 2.5;
              const projSpeed = 160;
              projectiles.push({
                id: Math.random().toString(),
                x: e.x + (e.facing === 'right' ? e.width + 5 : -5),
                y: e.y + 20,
                vx: (dx / dist) * projSpeed,
                vy: (dy / dist) * projSpeed * 0.4,
                radius: 8,
                damage: e.damage,
                fromPlayer: false,
                life: 2.5,
                maxLife: 2.5,
                color: '#5bc0be',
                type: 'spirit_orb',
              });
              particles.emitHitSparks(e.x + 18, e.y + 20, 6, '#5bc0be');
            }
          }
          break;
        }

        // ------------------------------------
        // 4. IRON HUNTER (Armored brute with frontal shield)
        // ------------------------------------
        case 'iron_hunter': {
          e.facing = dx > 0 ? 'right' : 'left';
          // Slow heavy march
          const speed = 35;
          e.vx = e.facing === 'right' ? speed : -speed;
          e.x += e.vx * dt;

          // Heavy ground smash when close
          if (dist < 60 && e.attackCooldown <= 0) {
            e.attackCooldown = 2.4;
            if (!player.isInvulnerable && !player.isDashing) {
              playerDamage += e.damage;
              hitSource = 'Iron Hunter Spiked Mace';
              particles.emitHitSparks(player.x + 15, player.y + 20, 10, '#e63946');
              audio.playHit();
            }
          }
          break;
        }

        default:
          break;
      }
    }

    return { playerDamage, hitSource };
  }
}
