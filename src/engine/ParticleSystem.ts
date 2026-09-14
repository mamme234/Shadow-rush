import { Particle } from '../types/game';

export class ParticleSystem {
  public particles: Particle[] = [];
  private maxParticles: number = 200;

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Subtle gravity or friction based on particle shape
      if (p.shape === 'smoke') {
        p.vy -= 15 * dt; // rises
        p.vx *= 0.94;
      } else if (p.shape === 'petal') {
        p.vx += Math.sin(p.life * 6) * 20 * dt;
        p.vy += 25 * dt;
      } else {
        p.vy += 200 * dt; // spark gravity
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public emitDust(x: number, y: number, count: number = 6) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        id: Math.random().toString(),
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 70,
        vy: -Math.random() * 40 - 10,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        color: '#6c757d',
        size: 3 + Math.random() * 3,
        shape: 'smoke',
      });
    }
  }

  public emitDashTrail(x: number, y: number, color: string, facing: 'left' | 'right') {
    for (let i = 0; i < 4; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const dir = facing === 'left' ? 1 : -1;
      this.particles.push({
        id: Math.random().toString(),
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 20,
        vx: dir * (40 + Math.random() * 60),
        vy: (Math.random() - 0.5) * 40,
        life: 0.2 + Math.random() * 0.15,
        maxLife: 0.35,
        color,
        size: 5 + Math.random() * 4,
        shape: 'smoke',
      });
    }
  }

  public emitSlashArc(x: number, y: number, facing: 'left' | 'right', color: string = '#48cae4') {
    const dir = facing === 'right' ? 1 : -1;
    for (let i = 0; i < 10; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (i / 10) * Math.PI - Math.PI / 2;
      this.particles.push({
        id: Math.random().toString(),
        x: x + dir * (25 + Math.cos(angle) * 20),
        y: y + Math.sin(angle) * 30,
        vx: dir * (100 + Math.cos(angle) * 80),
        vy: Math.sin(angle) * 70,
        life: 0.15 + Math.random() * 0.1,
        maxLife: 0.25,
        color,
        size: 3 + Math.random() * 3,
        shape: 'spark',
      });
    }
  }

  public emitHitSparks(x: number, y: number, count: number = 8, color: string = '#ffd166') {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.2 + Math.random() * 0.2,
        maxLife: 0.4,
        color,
        size: 2.5 + Math.random() * 3,
        shape: 'spark',
      });
    }
  }

  public emitBloodBurst(x: number, y: number, count: number = 10) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        color: '#e63946',
        size: 3 + Math.random() * 3,
        shape: 'circle',
      });
    }
  }

  public emitShardSparkle(x: number, y: number, count: number = 8) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
        color: '#48cae4',
        size: 3 + Math.random() * 2,
        shape: 'spark',
      });
    }
  }

  public emitLanternFlames(x: number, y: number, count: number = 12) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        id: Math.random().toString(),
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 30,
        vy: -40 - Math.random() * 60,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color: Math.random() > 0.5 ? '#5bc0be' : '#fca311',
        size: 4 + Math.random() * 4,
        shape: 'smoke',
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
