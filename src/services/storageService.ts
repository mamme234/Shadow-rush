import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletState } from '../types/economy';
import {
  Achievement,
  DailyLoginReward,
  GameSettings,
  LevelProgress,
  Mission,
  PlayerProfile,
} from '../types/progress';
import { INITIAL_COSMETICS, INITIAL_UPGRADES } from '../constants/economyConfig';
import { CosmeticItem, UpgradeItem } from '../types/economy';

const STORAGE_KEYS = {
  SAVE_VERSION: '@shadow_rush_v1_version',
  PROFILE: '@shadow_rush_v1_profile',
  WALLET: '@shadow_rush_v1_wallet',
  UPGRADES: '@shadow_rush_v1_upgrades',
  COSMETICS: '@shadow_rush_v1_cosmetics',
  LEVELS_PROGRESS: '@shadow_rush_v1_levels',
  MISSIONS: '@shadow_rush_v1_missions',
  DAILY_LOGIN: '@shadow_rush_v1_daily_login',
  ACHIEVEMENTS: '@shadow_rush_v1_achievements',
  SETTINGS: '@shadow_rush_v1_settings',
  AUDIT_LOGS: '@shadow_rush_v1_audit_logs',
};

const DEFAULT_PROFILE: PlayerProfile = {
  username: 'Kairo',
  title: 'Shadow Initiate',
  avatar: 'ninja_mask',
  level: 1,
  xp: 0,
  nextLevelXp: 500,
  totalScore: 0,
  totalEnemiesDefeated: 0,
  totalBossesDefeated: 0,
  totalSecretsFound: 0,
  starsEarned: 0,
  levelsCleared: 0,
  joinedDate: '2026-09-14',
};

const DEFAULT_WALLET: WalletState = {
  shards: 150, // Starting bonus
  lifetimeEarned: 150,
  lifetimeSpent: 0,
  transactions: [
    {
      id: 'tx_init',
      timestamp: Date.now(),
      title: 'Initiate Gift',
      description: 'Starting sacred shards bestowed by the Shadow Guild.',
      amount: 150,
      category: 'admin_grant',
      balanceAfter: 150,
    },
  ],
};

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  vibration: true,
  reducedMotion: false,
  screenShake: true,
  damageNumbers: true,
  highContrast: false,
  controlSize: 'medium',
  controlOpacity: 0.85,
  controlLayout: 'classic',
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete the tutorial level in Moonlit Forest.',
    current: 0,
    target: 1,
    unlocked: false,
    rewardShards: 100,
    rewardXp: 150,
    icon: 'footsteps',
  },
  {
    id: 'shadow_hunter',
    title: 'Shadow Hunter',
    description: 'Vanquish 20 corrupted Hollow enemies.',
    current: 0,
    target: 20,
    unlocked: false,
    rewardShards: 250,
    rewardXp: 300,
    icon: 'skull',
  },
  {
    id: 'trap_master',
    title: 'Trap Master',
    description: 'Survive 3 levels without suffering fatal trap damage.',
    current: 0,
    target: 3,
    unlocked: false,
    rewardShards: 200,
    rewardXp: 250,
    icon: 'shield-checkmark',
  },
  {
    id: 'boss_slayer',
    title: 'Boss Slayer',
    description: 'Defeat Kage-no-Oni in World 1 Sanctuary.',
    current: 0,
    target: 1,
    unlocked: false,
    rewardShards: 1000,
    rewardXp: 1200,
    icon: 'trophy',
  },
  {
    id: 'perfect_run',
    title: 'Perfect Run',
    description: 'Earn 3 stars on any level.',
    current: 0,
    target: 1,
    unlocked: false,
    rewardShards: 300,
    rewardXp: 350,
    icon: 'star',
  },
  {
    id: 'treasure_seeker',
    title: 'Treasure Seeker',
    description: 'Discover 3 hidden Moon Sigils or Memory Fragments.',
    current: 0,
    target: 3,
    unlocked: false,
    rewardShards: 400,
    rewardXp: 450,
    icon: 'sparkles',
  },
  {
    id: 'night_warrior',
    title: 'Night Warrior',
    description: 'Reach Player Level 5 in progression.',
    current: 1,
    target: 5,
    unlocked: false,
    rewardShards: 500,
    rewardXp: 600,
    icon: 'flame',
  },
  {
    id: 'master_ninja',
    title: 'Master Ninja',
    description: 'Unlock the Moonlight Somersault (Double Jump).',
    current: 0,
    target: 1,
    unlocked: false,
    rewardShards: 400,
    rewardXp: 500,
    icon: 'ribbon',
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm_kill_guards',
    title: 'Guard Patrol Purge',
    description: 'Defeat 5 Shadow Guards across any level.',
    category: 'daily',
    current: 0,
    target: 5,
    rewardShards: 200,
    rewardXp: 250,
    completed: false,
    claimed: false,
    icon: 'shield',
  },
  {
    id: 'm_collect_shards',
    title: 'Moonlight Harvester',
    description: 'Gather 30 Shadow Shards in gameplay.',
    category: 'daily',
    current: 0,
    target: 30,
    rewardShards: 150,
    rewardXp: 200,
    completed: false,
    claimed: false,
    icon: 'diamond',
  },
  {
    id: 'm_beat_levels',
    title: 'Swift Infiltration',
    description: 'Complete 2 levels in World 1.',
    category: 'daily',
    current: 0,
    target: 2,
    rewardShards: 300,
    rewardXp: 350,
    completed: false,
    claimed: false,
    icon: 'navigate',
  },
  {
    id: 'm_secret_sigil',
    title: 'Sacred Relic',
    description: 'Find 1 hidden Moon Sigil.',
    category: 'story',
    current: 0,
    target: 1,
    rewardShards: 350,
    rewardXp: 400,
    completed: false,
    claimed: false,
    icon: 'eye',
  },
];

export const INITIAL_DAILY_LOGIN: DailyLoginReward[] = [
  { day: 1, shards: 100, xp: 150, bonusTitle: 'Day 1 Rations', claimed: false },
  { day: 2, shards: 150, xp: 200, bonusTitle: 'Sharpened Kunai', claimed: false },
  { day: 3, shards: 220, xp: 250, bonusTitle: 'Shadow Vial', claimed: false },
  { day: 4, shards: 300, xp: 350, bonusTitle: 'Ninja Scroll', claimed: false },
  { day: 5, shards: 400, xp: 450, bonusTitle: 'Moonlit Brooch', claimed: false },
  { day: 6, shards: 550, xp: 600, bonusTitle: 'Ancient Relic', claimed: false },
  { day: 7, shards: 1000, xp: 1200, bonusTitle: 'Master Crest', claimed: false },
];

export class StorageService {
  public static async loadProfile(): Promise<PlayerProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  public static async saveProfile(profile: PlayerProfile): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  public static async loadWallet(): Promise<WalletState> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WALLET);
      return data ? JSON.parse(data) : DEFAULT_WALLET;
    } catch {
      return DEFAULT_WALLET;
    }
  }

  public static async saveWallet(wallet: WalletState): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
  }

  public static async loadUpgrades(): Promise<UpgradeItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.UPGRADES);
      return data ? JSON.parse(data) : INITIAL_UPGRADES;
    } catch {
      return INITIAL_UPGRADES;
    }
  }

  public static async saveUpgrades(upgrades: UpgradeItem[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.UPGRADES, JSON.stringify(upgrades));
  }

  public static async loadCosmetics(): Promise<CosmeticItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COSMETICS);
      return data ? JSON.parse(data) : INITIAL_COSMETICS;
    } catch {
      return INITIAL_COSMETICS;
    }
  }

  public static async saveCosmetics(cosmetics: CosmeticItem[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.COSMETICS, JSON.stringify(cosmetics));
  }

  public static async loadLevelsProgress(): Promise<Record<string, LevelProgress>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LEVELS_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public static async saveLevelsProgress(
    progress: Record<string, LevelProgress>
  ): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LEVELS_PROGRESS, JSON.stringify(progress));
  }

  public static async loadMissions(): Promise<Mission[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MISSIONS);
      return data ? JSON.parse(data) : INITIAL_MISSIONS;
    } catch {
      return INITIAL_MISSIONS;
    }
  }

  public static async saveMissions(missions: Mission[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  }

  public static async loadDailyLogin(): Promise<DailyLoginReward[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGIN);
      return data ? JSON.parse(data) : INITIAL_DAILY_LOGIN;
    } catch {
      return INITIAL_DAILY_LOGIN;
    }
  }

  public static async saveDailyLogin(rewards: DailyLoginReward[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGIN, JSON.stringify(rewards));
  }

  public static async loadAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  public static async saveAchievements(achievements: Achievement[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  public static async loadSettings(): Promise<GameSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static async saveSettings(settings: GameSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  public static async getAuditLogs(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static async logAudit(action: string): Promise<void> {
    try {
      const logs = await this.getAuditLogs();
      const entry = `[${new Date().toISOString()}] ${action}`;
      logs.unshift(entry);
      if (logs.length > 50) logs.pop();
      await AsyncStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch {
      // Safe fallback
    }
  }

  public static async resetAllData(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  }
}
