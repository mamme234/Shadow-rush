export interface LevelProgress {
  levelId: string;
  worldId: number;
  completed: boolean;
  stars: number; // 0 to 3
  highScore: number;
  bestTime: number; // in seconds
  shardsCollected: number;
  sigilCollected: boolean;
  secretFound: boolean;
  enemiesKilled: number;
}

export interface WorldData {
  id: number;
  name: string;
  tagline: string;
  description: string;
  themeColor: string;
  accentColor: string;
  unlocked: boolean;
  requiredStars: number;
  levelsCount: number;
  bossName: string;
  bossDefeated: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'story' | 'combat';
  current: number;
  target: number;
  rewardShards: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface DailyLoginReward {
  day: number;
  shards: number;
  xp: number;
  bonusTitle?: string;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
  rewardShards: number;
  rewardXp: number;
  icon: string;
}

export interface PlayerProfile {
  username: string;
  title: string;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  totalScore: number;
  totalEnemiesDefeated: number;
  totalBossesDefeated: number;
  totalSecretsFound: number;
  starsEarned: number;
  levelsCleared: number;
  joinedDate: string;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  vibration: boolean;
  reducedMotion: boolean;
  screenShake: boolean;
  damageNumbers: boolean;
  highContrast: boolean;
  controlSize: 'small' | 'medium' | 'large';
  controlOpacity: number;
  controlLayout: 'classic' | 'compact' | 'spread';
}
