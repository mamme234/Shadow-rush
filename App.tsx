import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

import { THEME } from './src/constants/theme';
import { WORLD_1_LEVELS } from './src/constants/levelsData';
import { ECONOMY_CONFIG, INITIAL_COSMETICS, INITIAL_UPGRADES } from './src/constants/economyConfig';
import { StorageService } from './src/services/storageService';
import { EconomyService } from './src/services/economyService';
import { MissionService } from './src/services/missionService';
import { audio } from './src/services/audioService';

import { CosmeticItem, UpgradeItem, WalletState } from './src/types/economy';
import {
  Achievement,
  DailyLoginReward,
  GameSettings,
  LevelProgress,
  Mission,
  PlayerProfile,
} from './src/types/progress';
import { LevelData, PlayerStats } from './src/types/game';

// Screens
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { GameView } from './src/components/game/GameView';
import { WorldMapScreen } from './src/screens/WorldMapScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { MissionsScreen } from './src/screens/MissionsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AchievementsScreen } from './src/screens/AchievementsScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { StoryScreen } from './src/screens/StoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AdminScreen } from './src/screens/AdminScreen';

type ScreenName =
  | 'main_menu'
  | 'game'
  | 'world_map'
  | 'shop'
  | 'missions'
  | 'profile'
  | 'achievements'
  | 'leaderboard'
  | 'story'
  | 'settings'
  | 'admin';

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('main_menu');
  const [activeLevelId, setActiveLevelId] = useState<string>('w1_l1');

  // Core Game State
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>(INITIAL_UPGRADES);
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>(INITIAL_COSMETICS);
  const [levelsProgress, setLevelsProgress] = useState<Record<string, LevelProgress>>({});
  const [missions, setMissions] = useState<Mission[]>([]);
  const [dailyLogin, setDailyLogin] = useState<DailyLoginReward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [settings, setSettings] = useState<GameSettings | null>(null);

  // Load all persisted data on mount
  const refreshAllData = useCallback(async () => {
    const [
      loadedProfile,
      loadedWallet,
      loadedUpgrades,
      loadedCosmetics,
      loadedProgress,
      loadedMissions,
      loadedDailyLogin,
      loadedAchievements,
      loadedSettings,
    ] = await Promise.all([
      StorageService.loadProfile(),
      StorageService.loadWallet(),
      StorageService.loadUpgrades(),
      StorageService.loadCosmetics(),
      StorageService.loadLevelsProgress(),
      StorageService.loadMissions(),
      StorageService.loadDailyLogin(),
      StorageService.loadAchievements(),
      StorageService.loadSettings(),
    ]);

    setProfile(loadedProfile);
    setWallet(loadedWallet);
    setUpgrades(loadedUpgrades);
    setCosmetics(loadedCosmetics);
    setLevelsProgress(loadedProgress);
    setMissions(loadedMissions);
    setDailyLogin(loadedDailyLogin);
    setAchievements(loadedAchievements);
    setSettings(loadedSettings);

    if (loadedSettings) {
      audio.setVolumes(
        loadedSettings.masterVolume,
        loadedSettings.musicVolume,
        loadedSettings.sfxVolume
      );
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Compute stats from upgrades
  const vitalityItem = upgrades.find((u) => u.id === 'vitality');
  const bladeItem = upgrades.find((u) => u.id === 'blade');
  const dashItem = upgrades.find((u) => u.id === 'dash');
  const doubleJumpItem = upgrades.find((u) => u.id === 'double_jump');
  const specialItem = upgrades.find((u) => u.id === 'special');

  const computedPlayerStats: PlayerStats = {
    maxHealth: 100 + (vitalityItem ? vitalityItem.currentLevel - 1 : 0) * 25,
    damageMultiplier: 1.0 + (bladeItem ? bladeItem.currentLevel - 1 : 0) * 0.25,
    dashCooldown: [1.0, 0.8, 0.65, 0.5][dashItem ? dashItem.currentLevel - 1 : 0] || 0.8,
    dashSpeed: 650,
    hasDoubleJump: (doubleJumpItem ? doubleJumpItem.currentLevel : 0) >= 1,
    specialDamage: [40, 65, 95, 140][specialItem ? specialItem.currentLevel - 1 : 0] || 40,
  };

  const equippedSkin = cosmetics.find((c) => c.type === 'skin' && c.equipped)?.id || 'skin_default';
  const equippedTrail = cosmetics.find((c) => c.type === 'trail' && c.equipped)?.id || 'trail_smoke';

  // Calculate total stars across all levels
  const totalStars = Object.values(levelsProgress).reduce((acc, lvl) => acc + (lvl.stars || 0), 0);

  // Quick Play finds latest unlocked level
  const handleQuickPlay = () => {
    let targetId = WORLD_1_LEVELS[0].id;
    for (let i = 0; i < WORLD_1_LEVELS.length; i++) {
      const lvl = WORLD_1_LEVELS[i];
      if (!levelsProgress[lvl.id]?.completed) {
        targetId = lvl.id;
        break;
      }
    }
    setActiveLevelId(targetId);
    setCurrentScreen('game');
  };

  const handleSelectLevel = (levelId: string) => {
    setActiveLevelId(levelId);
    setCurrentScreen('game');
  };

  // Handle Level Completion
  const handleLevelComplete = async (
    stars: number,
    stats: { time: number; shards: number; score: number }
  ) => {
    const currentLevel = WORLD_1_LEVELS.find((l) => l.id === activeLevelId);
    const existingProgress = levelsProgress[activeLevelId];
    const isFirstTimeClear = !existingProgress?.completed;

    // Calculate virtual shard and XP rewards
    const baseShards = ECONOMY_CONFIG.REWARDS.LEVEL_CLEAR_BASE_SHARDS;
    const starBonusShards = stars === 3 ? ECONOMY_CONFIG.REWARDS.THREE_STAR_BONUS_SHARDS : 0;
    const collectedPickupsShards = stats.shards * ECONOMY_CONFIG.REWARDS.SHARD_PICKUP;
    const totalAwardedShards = baseShards + starBonusShards + collectedPickupsShards;

    const baseXP = ECONOMY_CONFIG.REWARDS.LEVEL_CLEAR_BASE_XP;
    const starBonusXP = stars === 3 ? ECONOMY_CONFIG.REWARDS.THREE_STAR_BONUS_XP : 0;
    const totalAwardedXP = baseXP + starBonusXP;

    // 1. Credit Virtual Currency
    await EconomyService.addVirtualShards(
      totalAwardedShards,
      `Cleared: ${currentLevel?.title || 'Level'}`,
      `Stars: ${stars}★, Shards: +${collectedPickupsShards}, Time: ${stats.time}s`,
      'level_clear'
    );

    // 2. Award Ninja XP
    await EconomyService.addXp(totalAwardedXP);

    // 3. Save Level Progress
    const updatedProgress = {
      ...levelsProgress,
      [activeLevelId]: {
        levelId: activeLevelId,
        worldId: 1,
        completed: true,
        stars: Math.max(existingProgress?.stars || 0, stars),
        highScore: Math.max(existingProgress?.highScore || 0, stats.score),
        bestTime: existingProgress?.bestTime
          ? Math.min(existingProgress.bestTime, stats.time)
          : stats.time,
        shardsCollected: Math.max(existingProgress?.shardsCollected || 0, stats.shards),
        sigilCollected: true,
        secretFound: true,
        enemiesKilled: 3,
      },
    };
    await StorageService.saveLevelsProgress(updatedProgress);
    setLevelsProgress(updatedProgress);

    // 4. Update Profile Totals
    if (profile) {
      const updatedProfile: PlayerProfile = {
        ...profile,
        totalScore: profile.totalScore + stats.score,
        levelsCleared: isFirstTimeClear ? profile.levelsCleared + 1 : profile.levelsCleared,
        starsEarned: Object.values(updatedProgress).reduce((acc, l) => acc + (l.stars || 0), 0),
        totalEnemiesDefeated: profile.totalEnemiesDefeated + 4,
        totalBossesDefeated: currentLevel?.boss
          ? profile.totalBossesDefeated + 1
          : profile.totalBossesDefeated,
      };
      await StorageService.saveProfile(updatedProfile);
      setProfile(updatedProfile);
    }

    // 5. Update Mission Progress
    await MissionService.recordAction('beat_level', 1);
    await MissionService.recordAction('collect_shard', stats.shards);
    await MissionService.recordAction('kill_enemy', 4);

    // 6. Check Achievements
    await EconomyService.checkAchievement('first_step', 1);
    if (stars === 3) {
      await EconomyService.checkAchievement('perfect_run', 1);
    }
    if (currentLevel?.boss) {
      await EconomyService.checkAchievement('boss_slayer', 1);
    }

    // Refresh memory
    refreshAllData();
  };

  const handleNextLevel = () => {
    const currentIndex = WORLD_1_LEVELS.findIndex((l) => l.id === activeLevelId);
    if (currentIndex >= 0 && currentIndex < WORLD_1_LEVELS.length - 1) {
      setActiveLevelId(WORLD_1_LEVELS[currentIndex + 1].id);
      setCurrentScreen('game');
    } else {
      setCurrentScreen('world_map');
    }
  };

  const handleUnlockAllLevels = async () => {
    const allProgress: Record<string, LevelProgress> = {};
    WORLD_1_LEVELS.forEach((lvl) => {
      allProgress[lvl.id] = {
        levelId: lvl.id,
        worldId: 1,
        completed: true,
        stars: 3,
        highScore: 8500,
        bestTime: 38,
        shardsCollected: lvl.targetShards,
        sigilCollected: true,
        secretFound: true,
        enemiesKilled: 5,
      };
    });
    await StorageService.saveLevelsProgress(allProgress);
    setLevelsProgress(allProgress);
    refreshAllData();
  };

  const handleResetAllData = async () => {
    await StorageService.resetAllData();
    await refreshAllData();
    setCurrentScreen('main_menu');
  };

  if (!fontsLoaded || !profile || !wallet || !settings) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" backgroundColor="#05070a" />
      </View>
    );
  }

  const currentLevelData: LevelData =
    WORLD_1_LEVELS.find((l) => l.id === activeLevelId) || WORLD_1_LEVELS[0];
  const currentLevelIndex = WORLD_1_LEVELS.findIndex((l) => l.id === activeLevelId);
  const hasNextLevel = currentLevelIndex >= 0 && currentLevelIndex < WORLD_1_LEVELS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#05070a" />

      {currentScreen === 'main_menu' && (
        <MainMenuScreen
          profile={profile}
          wallet={wallet}
          onNavigate={(screen) => {
            if (screen === 'game') {
              handleQuickPlay();
            } else {
              setCurrentScreen(screen);
            }
          }}
          onQuickPlay={handleQuickPlay}
        />
      )}

      {currentScreen === 'game' && (
        <GameView
          key={activeLevelId}
          level={currentLevelData}
          playerStats={computedPlayerStats}
          cosmetics={{ skin: equippedSkin, trail: equippedTrail }}
          touchConfig={{
            size: settings.controlSize,
            opacity: settings.controlOpacity,
            layout: settings.controlLayout,
          }}
          onLevelComplete={handleLevelComplete}
          onNextLevel={handleNextLevel}
          onExit={() => setCurrentScreen('main_menu')}
          hasNextLevel={hasNextLevel}
        />
      )}

      {currentScreen === 'world_map' && (
        <WorldMapScreen
          levelsProgress={levelsProgress}
          shards={wallet.shards}
          playerLevel={profile.level}
          totalStars={totalStars}
          onSelectLevel={handleSelectLevel}
          onBack={() => setCurrentScreen('main_menu')}
          onAdminPress={() => setCurrentScreen('admin')}
        />
      )}

      {currentScreen === 'shop' && (
        <ShopScreen
          wallet={wallet}
          upgrades={upgrades}
          cosmetics={cosmetics}
          playerLevel={profile.level}
          onRefreshData={refreshAllData}
          onBack={() => setCurrentScreen('main_menu')}
          onAdminPress={() => setCurrentScreen('admin')}
        />
      )}

      {currentScreen === 'missions' && (
        <MissionsScreen
          missions={missions}
          dailyLogin={dailyLogin}
          shards={wallet.shards}
          playerLevel={profile.level}
          onRefreshData={refreshAllData}
          onBack={() => setCurrentScreen('main_menu')}
          onAdminPress={() => setCurrentScreen('admin')}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen
          profile={profile}
          wallet={wallet}
          onBack={() => setCurrentScreen('main_menu')}
          onAdminPress={() => setCurrentScreen('admin')}
        />
      )}

      {currentScreen === 'achievements' && (
        <AchievementsScreen
          achievements={achievements}
          shards={wallet.shards}
          playerLevel={profile.level}
          onBack={() => setCurrentScreen('main_menu')}
          onAdminPress={() => setCurrentScreen('admin')}
        />
      )}

      {currentScreen === 'leaderboard' && (
        <LeaderboardScreen
          profile={profile}
          shards={wallet.shards}
          onBack={() => setCurrentScreen('main_menu')}
          onAdminPress={() => setCurrentScreen('admin')}
        />
      )}

      {currentScreen === 'story' && (
        <StoryScreen
          shards={wallet.shards}
          playerLevel={profile.level}
          onBack={() => setCurrentScreen('main_menu')}
          onAdminPress={() => setCurrentScreen('admin')}
          onPlayNow={handleQuickPlay}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          settings={settings}
          shards={wallet.shards}
          playerLevel={profile.level}
          onUpdateSettings={async (newSettings) => {
            setSettings(newSettings);
            await StorageService.saveSettings(newSettings);
          }}
          onResetAllData={handleResetAllData}
          onBack={() => setCurrentScreen('main_menu')}
          onAdminPress={() => setCurrentScreen('admin')}
        />
      )}

      {currentScreen === 'admin' && (
        <AdminScreen
          shards={wallet.shards}
          playerLevel={profile.level}
          onRefreshData={refreshAllData}
          onUnlockAllLevels={handleUnlockAllLevels}
          onBack={() => setCurrentScreen('main_menu')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05070a',
  },
});
