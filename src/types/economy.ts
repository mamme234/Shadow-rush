export type TransactionCategory =
  | 'level_clear'
  | 'enemy_defeat'
  | 'pickup'
  | 'moon_sigil'
  | 'memory_fragment'
  | 'stat_upgrade'
  | 'cosmetic_purchase'
  | 'mission_reward'
  | 'daily_login'
  | 'boss_defeat'
  | 'admin_grant';

export interface WalletTransaction {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  amount: number; // positive for earned, negative for spent
  category: TransactionCategory;
  balanceAfter: number;
}

export interface WalletState {
  shards: number; // Virtual In-Game Currency ONLY
  lifetimeEarned: number;
  lifetimeSpent: number;
  transactions: WalletTransaction[];
}

export interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  category: 'vitality' | 'blade' | 'dash' | 'double_jump' | 'special';
  currentLevel: number;
  maxLevel: number;
  costs: number[]; // cost for each level [cost1, cost2, cost3, ...]
  statLabel: string;
  levelValues: string[]; // ["100 HP", "125 HP", "150 HP", "175 HP", "200 HP"]
  icon: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'skin' | 'trail' | 'weapon';
  description: string;
  cost: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
  accentColor: string;
  unlocked: boolean;
  equipped: boolean;
}
