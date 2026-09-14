import { CosmeticItem, UpgradeItem, WalletState, WalletTransaction } from '../types/economy';
import { PlayerProfile } from '../types/progress';
import { StorageService } from './storageService';
import { ECONOMY_CONFIG } from '../constants/economyConfig';

export class EconomyService {
  /**
   * Adds virtual shards to wallet with a recorded transaction.
   * STRICT NOTE: Virtual in-game currency only. No cash value.
   */
  public static async addVirtualShards(
    amount: number,
    title: string,
    description: string,
    category: WalletTransaction['category']
  ): Promise<WalletState> {
    const wallet = await StorageService.loadWallet();
    const cleanAmount = Math.max(0, Math.floor(amount));
    const newBalance = wallet.shards + cleanAmount;

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      title,
      description,
      amount: cleanAmount,
      category,
      balanceAfter: newBalance,
    };

    const updatedWallet: WalletState = {
      shards: newBalance,
      lifetimeEarned: wallet.lifetimeEarned + cleanAmount,
      lifetimeSpent: wallet.lifetimeSpent,
      transactions: [tx, ...wallet.transactions.slice(0, 49)], // keep last 50
    };

    await StorageService.saveWallet(updatedWallet);
    await StorageService.logAudit(`Earned ${cleanAmount} shards: ${title}`);
    return updatedWallet;
  }

  /**
   * Spends virtual shards if balance is sufficient.
   */
  public static async spendVirtualShards(
    amount: number,
    title: string,
    description: string,
    category: WalletTransaction['category']
  ): Promise<{ success: boolean; wallet: WalletState; error?: string }> {
    const wallet = await StorageService.loadWallet();
    const cleanAmount = Math.max(0, Math.floor(amount));

    if (wallet.shards < cleanAmount) {
      return {
        success: false,
        wallet,
        error: `Insufficient Shadow Shards. Required: ${cleanAmount}, Current: ${wallet.shards}`,
      };
    }

    const newBalance = wallet.shards - cleanAmount;
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      title,
      description,
      amount: -cleanAmount,
      category,
      balanceAfter: newBalance,
    };

    const updatedWallet: WalletState = {
      shards: newBalance,
      lifetimeEarned: wallet.lifetimeEarned,
      lifetimeSpent: wallet.lifetimeSpent + cleanAmount,
      transactions: [tx, ...wallet.transactions.slice(0, 49)],
    };

    await StorageService.saveWallet(updatedWallet);
    await StorageService.logAudit(`Spent ${cleanAmount} shards: ${title}`);
    return { success: true, wallet: updatedWallet };
  }

  /**
   * Purchases an upgrade tier.
   */
  public static async purchaseUpgrade(
    upgradeId: string
  ): Promise<{ success: boolean; upgrades: UpgradeItem[]; error?: string }> {
    const upgrades = await StorageService.loadUpgrades();
    const item = upgrades.find((u) => u.id === upgradeId);

    if (!item) {
      return { success: false, upgrades, error: 'Upgrade not found' };
    }

    if (item.currentLevel >= item.maxLevel) {
      return { success: false, upgrades, error: 'Max level already reached' };
    }

    const cost = item.costs[item.currentLevel] ?? item.costs[item.costs.length - 1];
    const spendRes = await this.spendVirtualShards(
      cost,
      `Upgrade: ${item.name}`,
      `Upgraded to level ${item.currentLevel + 1}`,
      'stat_upgrade'
    );

    if (!spendRes.success) {
      return { success: false, upgrades, error: spendRes.error };
    }

    item.currentLevel += 1;
    await StorageService.saveUpgrades(upgrades);

    // If double jump upgraded, unlock achievement
    if (item.id === 'double_jump' && item.currentLevel >= 1) {
      await this.checkAchievement('master_ninja', 1);
    }

    return { success: true, upgrades };
  }

  /**
   * Purchases or equips a cosmetic item.
   */
  public static async interactCosmetic(
    cosmeticId: string
  ): Promise<{ success: boolean; cosmetics: CosmeticItem[]; error?: string }> {
    const cosmetics = await StorageService.loadCosmetics();
    const item = cosmetics.find((c) => c.id === cosmeticId);

    if (!item) {
      return { success: false, cosmetics, error: 'Item not found' };
    }

    if (item.unlocked) {
      // Unequip same type and equip this one
      cosmetics.forEach((c) => {
        if (c.type === item.type) c.equipped = false;
      });
      item.equipped = true;
      await StorageService.saveCosmetics(cosmetics);
      return { success: true, cosmetics };
    }

    // Attempt purchase
    const spendRes = await this.spendVirtualShards(
      item.cost,
      `Cosmetic: ${item.name}`,
      `Purchased ${item.rarity} ${item.type}`,
      'cosmetic_purchase'
    );

    if (!spendRes.success) {
      return { success: false, cosmetics, error: spendRes.error };
    }

    item.unlocked = true;
    cosmetics.forEach((c) => {
      if (c.type === item.type) c.equipped = false;
    });
    item.equipped = true;
    await StorageService.saveCosmetics(cosmetics);
    return { success: true, cosmetics };
  }

  /**
   * Awards XP to player profile and levels up if threshold reached.
   */
  public static async addXp(amount: number): Promise<{ profile: PlayerProfile; leveledUp: boolean }> {
    const profile = await StorageService.loadProfile();
    let currentXp = profile.xp + amount;
    let currentLevel = profile.level;
    let nextLevelXp = profile.nextLevelXp;
    let leveledUp = false;

    while (currentXp >= nextLevelXp && currentLevel < ECONOMY_CONFIG.MAX_PLAYER_LEVEL) {
      currentXp -= nextLevelXp;
      currentLevel += 1;
      nextLevelXp = ECONOMY_CONFIG.calculateXpForLevel(currentLevel);
      leveledUp = true;
    }

    profile.xp = currentXp;
    profile.level = currentLevel;
    profile.nextLevelXp = nextLevelXp;

    await StorageService.saveProfile(profile);

    // Check level achievement
    await this.checkAchievement('night_warrior', currentLevel);

    return { profile, leveledUp };
  }

  public static async checkAchievement(achievementId: string, progressValue: number) {
    const achievements = await StorageService.loadAchievements();
    const ach = achievements.find((a) => a.id === achievementId);
    if (!ach || ach.unlocked) return;

    ach.current = Math.min(ach.target, Math.max(ach.current, progressValue));
    if (ach.current >= ach.target) {
      ach.unlocked = true;
      await this.addVirtualShards(
        ach.rewardShards,
        `Achievement: ${ach.title}`,
        ach.description,
        'admin_grant'
      );
      await this.addXp(ach.rewardXp);
    }
    await StorageService.saveAchievements(achievements);
  }
}
