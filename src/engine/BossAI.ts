import { Boss, PlayerState, Projectile } from '../types/game';
import { ParticleSystem } from './ParticleSystem';
import { audio } from '../services/audioService';

export class BossAI {
  public static updateBoss(
    boss: Boss,
    player: PlayerState,
    dt: number,
    projectiles: Projectile[],
    particles: ParticleSystem
  ): { playerDamage: number; hitSource?: string; bossDied: boolean } {
    let playerDamage = 0;
    let hitSource: string | undefined;
    let bossDied = false;

    if (boss.health <= 0) {
      if (boss.state !== 'defeated') {
        boss.state = 'defeated';
        bossDied = true;
        audio.playEnemyDeath();
        particles.emitHitSparks(boss.x + 30, boss.y + 40, 30, '#fca311');
        particles.emitBloodBurst(boss.x + 30, boss.y + 40, 25);
      }
      return { playerDamage: 0, bossDied };
    }

    // Check Phase Transition at 50% HP
    if (boss.health < boss.maxHealth * 0.5 && boss.phase === 1) {
      boss.phase = 2;
      boss.state = 'intro';
      boss.timer = 1.5;
      audio.playBossRoar();
      particles.emitHitSparks(boss.x + 30, boss.y + 40, 20, '#e63946');
    }

    const dx = player.x - boss.x;
    boss.facing = dx > 0 ? 'right' : 'left';
    boss.timer -= dt;

    switch (boss.state) {
      case 'intro': {
        if (boss.timer <= 0) {
          boss.state = 'idle';
          boss.timer = 1.0;
        }
        break;
      }

      case 'idle': {
        boss.vx = 0;
        if (boss.timer <= 0) {
          // Choose next move
          const moves = boss.phase === 1
            ? ['shadow_dash', 'slash_combo']
            : ['shadow_dash', 'spike_summon', 'clone_burst'];
          const chosen = moves[Math.floor(Math.random() * moves.length)] as any;
          boss.state = chosen;

          if (chosen === 'shadow_dash') {
            boss.timer = 1.2;
            boss.vx = boss.facing === 'right' ? 380 : -380;
            audio.playDash();
          } else if (chosen === 'slash_combo') {
            boss.timer = 0.8;
            audio.playSlash();
          } else if (chosen === 'spike_summon') {
            boss.timer = 1.6;
            audio.playBossRoar();
            // Erupt shadow spikes across floor
            this.summonFloorSpikes(boss, projectiles, particles);
          } else if (chosen === 'clone_burst') {
            boss.timer = 1.0;
            this.summonCloneProjectiles(boss, projectiles, particles);
          }
        }
        break;
      }

      case 'shadow_dash': {
        boss.x += boss.vx * dt;
        particles.emitDashTrail(boss.x + 25, boss.y + 40, '#7209b7', boss.facing);

        // Clamp inside arena
        if (boss.x < boss.arenaLeft) {
          boss.x = boss.arenaLeft;
          boss.vx = Math.abs(boss.vx);
        } else if (boss.x + boss.width > boss.arenaRight) {
          boss.x = boss.arenaRight - boss.width;
          boss.vx = -Math.abs(boss.vx);
        }

        // Deal contact damage if player collides
        const hit =
          player.x < boss.x + boss.width &&
          player.x + player.width > boss.x &&
          player.y < boss.y + boss.height &&
          player.y + player.height > boss.y;

        if (hit && !player.isInvulnerable && !player.isDashing) {
          playerDamage += 25;
          hitSource = 'Kage-no-Oni Shadow Charge';
          audio.playHit();
        }

        if (boss.timer <= 0) {
          boss.state = 'stunned'; // Vulnerable window for player to attack!
          boss.timer = 1.4;
          boss.vulnerable = true;
          boss.vx = 0;
        }
        break;
      }

      case 'slash_combo': {
        boss.vx = 0;
        const dist = Math.abs(player.x - boss.x);
        if (dist < 75 && !player.isInvulnerable && !player.isDashing) {
          playerDamage += 20;
          hitSource = 'Revenant Katana Combo';
          audio.playHit();
        }
        particles.emitSlashArc(boss.x + 30, boss.y + 40, boss.facing, '#e63946');
        if (boss.timer <= 0) {
          boss.state = 'idle';
          boss.timer = 1.0;
        }
        break;
      }

      case 'spike_summon': {
        boss.vx = 0;
        if (boss.timer <= 0) {
          boss.state = 'idle';
          boss.timer = 1.2;
        }
        break;
      }

      case 'clone_burst': {
        boss.vx = 0;
        if (boss.timer <= 0) {
          boss.state = 'idle';
          boss.timer = 1.0;
        }
        break;
      }

      case 'stunned': {
        boss.vx = 0;
        particles.emitHitSparks(boss.x + 30, boss.y + 20, 2, '#48cae4');
        if (boss.timer <= 0) {
          boss.state = 'idle';
          boss.timer = 0.8;
          boss.vulnerable = false;
        }
        break;
      }

      default:
        break;
    }

    return { playerDamage, hitSource, bossDied };
  }

  private static summonFloorSpikes(
    boss: Boss,
    projectiles: Projectile[],
    particles: ParticleSystem
  ) {
    const spikePositions = [600, 800, 1000, 1200, 1400, 1600];
    spikePositions.forEach((xPos) => {
      projectiles.push({
        id: Math.random().toString(),
        x: xPos,
        y: 540,
        vx: 0,
        vy: -150,
        radius: 12,
        damage: 30,
        fromPlayer: false,
        life: 1.4,
        maxLife: 1.4,
        color: '#e63946',
        type: 'boss_spike',
      });
      particles.emitHitSparks(xPos, 540, 8, '#e63946');
    });
  }

  private static summonCloneProjectiles(
    boss: Boss,
    projectiles: Projectile[],
    particles: ParticleSystem
  ) {
    [-1, 1].forEach((dir) => {
      projectiles.push({
        id: Math.random().toString(),
        x: boss.x + boss.width / 2,
        y: boss.y + 30,
        vx: dir * 260,
        vy: 0,
        radius: 14,
        damage: 25,
        fromPlayer: false,
        life: 2.2,
        maxLife: 2.2,
        color: '#7209b7',
        type: 'shadow_wave',
      });
    });
    particles.emitHitSparks(boss.x + 30, boss.y + 30, 12, '#7209b7');
  }
}
