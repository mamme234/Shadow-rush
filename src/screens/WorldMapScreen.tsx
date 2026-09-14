import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../constants/theme';
import { ALL_WORLDS } from '../constants/economyConfig';
import { WORLD_1_LEVELS } from '../constants/levelsData';
import { LevelProgress, WorldData } from '../types/progress';
import { Navbar } from '../components/ui/Navbar';
import { audio } from '../services/audioService';

interface WorldMapScreenProps {
  levelsProgress: Record<string, LevelProgress>;
  shards: number;
  playerLevel: number;
  totalStars: number;
  onSelectLevel: (levelId: string) => void;
  onBack: () => void;
  onAdminPress: () => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  levelsProgress,
  shards,
  playerLevel,
  totalStars,
  onSelectLevel,
  onBack,
  onAdminPress,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);

  const selectedWorld = ALL_WORLDS.find((w) => w.id === selectedWorldId) || ALL_WORLDS[0];

  return (
    <View style={styles.container}>
      <Navbar
        title="WORLD MAP"
        subtitle="THE FIVE REALMS"
        onBack={onBack}
        shards={shards}
        playerLevel={playerLevel}
        onAdminPress={onAdminPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* World Selection Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.worldTabsContainer}
        >
          {ALL_WORLDS.map((world) => {
            const isUnlocked = world.unlocked || totalStars >= world.requiredStars;
            const isSelected = world.id === selectedWorldId;

            return (
              <TouchableOpacity
                key={world.id}
                style={[
                  styles.worldTab,
                  isSelected && styles.worldTabSelected,
                  !isUnlocked && styles.worldTabLocked,
                ]}
                onPress={() => {
                  audio.playButton();
                  setSelectedWorldId(world.id);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.worldTabHeader}>
                  <Text style={[styles.worldNumText, isSelected && { color: THEME.colors.primary }]}>
                    WORLD {world.id}
                  </Text>
                  {!isUnlocked && (
                    <Ionicons name="lock-closed" size={12} color={THEME.colors.textMuted} />
                  )}
                </View>
                <Text style={styles.worldNameText} numberOfLines={1}>
                  {world.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected World Banner */}
        <View style={styles.worldBanner}>
          <View style={styles.bannerHeaderRow}>
            <View>
              <Text style={styles.bannerTagline}>{selectedWorld.tagline}</Text>
              <Text style={styles.bannerTitle}>{selectedWorld.name}</Text>
            </View>
            <View style={styles.starsSummaryBadge}>
              <Ionicons name="star" size={15} color={THEME.colors.gold} />
              <Text style={styles.starsSummaryText}>
                {selectedWorld.id === 1 ? `${totalStars}/15` : `Req: ${selectedWorld.requiredStars}★`}
              </Text>
            </View>
          </View>
          <Text style={styles.bannerDesc}>{selectedWorld.description}</Text>
        </View>

        {/* Level List for Selected World */}
        <View style={styles.levelsContainer}>
          <Text style={styles.sectionHeader}>LEVELS IN THIS REALM</Text>

          {selectedWorld.id === 1 ? (
            WORLD_1_LEVELS.map((lvl, index) => {
              const progress = levelsProgress[lvl.id];
              const stars = progress?.stars || 0;
              const isLocked = index > 0 && !levelsProgress[WORLD_1_LEVELS[index - 1].id]?.completed;
              const isBossLevel = !!lvl.boss;

              return (
                <View
                  key={lvl.id}
                  style={[
                    styles.levelCard,
                    isBossLevel && styles.bossLevelCard,
                    isLocked && styles.levelCardLocked,
                  ]}
                >
                  <View style={styles.levelCardLeft}>
                    <View
                      style={[
                        styles.levelNumberBadge,
                        isBossLevel && styles.bossBadge,
                        isLocked && styles.lockedBadge,
                      ]}
                    >
                      {isBossLevel ? (
                        <Ionicons name="skull" size={18} color={THEME.colors.crimson} />
                      ) : (
                        <Text style={styles.levelNumberText}>{lvl.levelNumber}</Text>
                      )}
                    </View>

                    <View style={styles.levelInfo}>
                      <Text style={styles.levelTitleText}>
                        {lvl.title} {isBossLevel ? '— [BOSS]' : ''}
                      </Text>
                      <Text style={styles.levelSubText}>{lvl.subtitle}</Text>

                      {/* Stars */}
                      <View style={styles.levelStarsRow}>
                        {[1, 2, 3].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= stars ? 'star' : 'star-outline'}
                            size={14}
                            color={s <= stars ? THEME.colors.gold : THEME.colors.textMuted}
                          />
                        ))}
                        {progress?.bestTime ? (
                          <Text style={styles.bestTimeText}>• Best: {progress.bestTime}s</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.playBtn, isLocked && styles.playBtnLocked]}
                    disabled={isLocked}
                    onPress={() => {
                      audio.playButton();
                      onSelectLevel(lvl.id);
                    }}
                    activeOpacity={0.8}
                  >
                    {isLocked ? (
                      <Ionicons name="lock-closed" size={16} color={THEME.colors.textMuted} />
                    ) : (
                      <>
                        <Ionicons name="play" size={14} color="#05070a" />
                        <Text style={styles.playBtnText}>{stars > 0 ? 'REPLAY' : 'START'}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.lockedWorldNotice}>
              <Ionicons name="lock-closed" size={38} color={THEME.colors.textMuted} />
              <Text style={styles.lockedNoticeTitle}>REALM CURRENTLY SEALED</Text>
              <Text style={styles.lockedNoticeDesc}>
                Gather {selectedWorld.requiredStars} Moon Stars across previous realms and defeat
                Kage-no-Oni to break the seal.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  worldTabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  worldTab: {
    width: 140,
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  worldTabSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.surfaceLight,
  },
  worldTabLocked: {
    opacity: 0.6,
  },
  worldTabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  worldNumText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  worldNameText: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  worldBanner: {
    marginHorizontal: 16,
    backgroundColor: THEME.colors.surfaceLight,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: 20,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bannerTagline: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bannerTitle: {
    color: THEME.colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  starsSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 163, 17, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  starsSummaryText: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  bannerDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  levelsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sectionHeader: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  bossLevelCard: {
    borderColor: 'rgba(230, 57, 70, 0.45)',
    backgroundColor: 'rgba(26, 17, 24, 0.85)',
  },
  levelCardLocked: {
    opacity: 0.5,
  },
  levelCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  levelNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(72, 202, 228, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(72, 202, 228, 0.3)',
  },
  bossBadge: {
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
    borderColor: 'rgba(230, 57, 70, 0.4)',
  },
  lockedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelNumberText: {
    color: THEME.colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitleText: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  levelSubText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  levelStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bestTimeText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  playBtnLocked: {
    backgroundColor: THEME.colors.surfaceLight,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  playBtnText: {
    color: '#05070a',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lockedWorldNotice: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginTop: 10,
  },
  lockedNoticeTitle: {
    color: THEME.colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 12,
  },
  lockedNoticeDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
