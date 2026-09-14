import { DailyLoginReward, Mission } from '../types/progress';
import { StorageService } from './storageService';
import { EconomyService } from './economyService';

export class MissionService {
  /**
   * Increments mission progress based on action type.
   */
  public static async recordAction(
    actionType: 'kill_enemy' | 'collect_shard' | 'beat_level' | 'find_sigil',
    count: number = 1
  ): Promise<Mission[]> {
    const missions = await StorageService.loadMissions();
    let changed = false;

    missions.forEach((m) => {
      if (m.completed) return;

      if (actionType === 'kill_enemy' && m.id === 'm_kill_guards') {
        m.current = Math.min(m.target, m.current + count);
        if (m.current >= m.target) m.completed = true;
        changed = true;
      } else if (actionType === 'collect_shard' && m.id === 'm_collect_shards') {
        m.current = Math.min(m.target, m.current + count);
        if (m.current >= m.target) m.completed = true;
        changed = true;
      } else if (actionType === 'beat_level' && m.id === 'm_beat_levels') {
        m.current = Math.min(m.target, m.current + count);
        if (m.current >= m.target) m.completed = true;
        changed = true;
      } else if (actionType === 'find_sigil' && m.id === 'm_secret_sigil') {
        m.current = Math.min(m.target, m.current + count);
        if (m.current >= m.target) m.completed = true;
        changed = true;
      }
    });

    if (changed) {
      await StorageService.saveMissions(missions);
    }
    return missions;
  }

  /**
   * Claims a completed mission reward safely (anti-duplicate claim prevention).
   */
  public static async claimMission(
    missionId: string
  ): Promise<{ success: boolean; mission?: Mission; error?: string }> {
    const missions = await StorageService.loadMissions();
    const mission = missions.find((m) => m.id === missionId);

    if (!mission) {
      return { success: false, error: 'Mission not found' };
    }

    if (!mission.completed) {
      return { success: false, error: 'Objective not completed yet' };
    }

    if (mission.claimed) {
      return { success: false, error: 'Reward already claimed' };
    }

    // Award virtual currency and XP
    mission.claimed = true;
    await StorageService.saveMissions(missions);

    await EconomyService.addVirtualShards(
      mission.rewardShards,
      `Mission: ${mission.title}`,
      `Completed: ${mission.description}`,
      'mission_reward'
    );

    await EconomyService.addXp(mission.rewardXp);
    return { success: true, mission };
  }

  /**
   * Claims a day's login reward.
   */
  public static async claimDailyLogin(
    dayNumber: number
  ): Promise<{ success: boolean; reward?: DailyLoginReward; error?: string }> {
    const list = await StorageService.loadDailyLogin();
    const item = list.find((d) => d.day === dayNumber);

    if (!item) {
      return { success: false, error: 'Invalid daily reward day' };
    }

    if (item.claimed) {
      return { success: false, error: 'Today’s reward is already claimed' };
    }

    // Make sure previous days are claimed
    const previousUnclaimed = list.filter((d) => d.day < dayNumber && !d.claimed);
    if (previousUnclaimed.length > 0) {
      return { success: false, error: `Please claim Day ${previousUnclaimed[0].day} first` };
    }

    item.claimed = true;
    await StorageService.saveDailyLogin(list);

    await EconomyService.addVirtualShards(
      item.shards,
      `Daily Login Day ${item.day}`,
      `Daily devotion reward: ${item.bonusTitle || 'Shards bonus'}`,
      'daily_login'
    );

    await EconomyService.addXp(item.xp);
    return { success: true, reward: item };
  }
}
