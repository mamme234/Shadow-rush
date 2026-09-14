import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../../constants/theme';
import { Boss, PlayerState } from '../../types/game';

interface HUDProps {
  player: PlayerState;
  levelTitle: string;
  levelNumber: number;
  shardsCount: number;
  score: number;
  boss?: Boss;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  levelTitle,
  levelNumber,
  shardsCount,
  score,
  boss,
  onPause,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
  const energyPercent = Math.max(0, Math.min(100, (player.energy / player.maxEnergy) * 100));
  const bossHpPercent = boss ? Math.max(0, Math.min(100, (boss.health / boss.maxHealth) * 100)) : 0;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top Bar */}
      <View style={styles.topRow} pointerEvents="box-none">
        {/* Left: Health & Energy Bars */}
        <View style={styles.playerStatusContainer}>
          <View style={styles.barWrapper}>
            <Ionicons name="heart" size={16} color={THEME.colors.crimson} style={styles.barIcon} />
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.hpFill,
                  {
                    width: `${hpPercent}%`,
                    backgroundColor:
                      hpPercent > 30 ? THEME.colors.crimson : THEME.colors.danger,
                  },
                ]}
              />
            </View>
            <Text style={styles.barValueText}>
              {Math.ceil(player.health)}/{player.maxHealth}
            </Text>
          </View>

          <View style={[styles.barWrapper, { marginTop: 4 }]}>
            <Ionicons name="flash" size={14} color={THEME.colors.primary} style={styles.barIcon} />
            <View style={styles.barTrack}>
              <View style={[styles.energyFill, { width: `${energyPercent}%` }]} />
            </View>
            <Text style={styles.barValueText}>{Math.floor(player.energy)}</Text>
          </View>
        </View>

        {/* Center: Level Title / Objective */}
        <View style={styles.levelBadgeContainer}>
          <Text style={styles.levelBadgeSubtitle}>WORLD 1 • LVL {levelNumber}</Text>
          <Text style={styles.levelBadgeTitle} numberOfLines={1}>
            {levelTitle}
          </Text>
        </View>

        {/* Right: Shards, Score & Pause */}
        <View style={styles.rightStatsContainer}>
          <View style={styles.statChip}>
            <Ionicons name="diamond" size={14} color={THEME.colors.primary} />
            <Text style={styles.statChipText}>{shardsCount}</Text>
          </View>

          <View style={styles.statChip}>
            <Ionicons name="trophy" size={14} color={THEME.colors.gold} />
            <Text style={styles.statChipText}>{score}</Text>
          </View>

          <TouchableOpacity
            style={styles.pauseButton}
            onPress={onPause}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="pause" size={18} color={THEME.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Boss Health Bar (when Boss is active) */}
      {boss && boss.health > 0 && (
        <View style={styles.bossBarContainer}>
          <View style={styles.bossHeaderRow}>
            <Text style={styles.bossNameText}>
              {boss.name} — <Text style={styles.bossTitleText}>{boss.title}</Text>
            </Text>
            <Text style={styles.bossPhaseBadge}>PHASE {boss.phase}</Text>
          </View>
          <View style={styles.bossBarTrack}>
            <View
              style={[
                styles.bossBarFill,
                {
                  width: `${bossHpPercent}%`,
                  backgroundColor:
                    boss.phase === 2 ? THEME.colors.danger : THEME.colors.crimson,
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerStatusContainer: {
    backgroundColor: 'rgba(11, 14, 20, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(72, 202, 228, 0.25)',
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barIcon: {
    marginRight: 6,
  },
  barTrack: {
    width: 90,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    borderRadius: 4,
  },
  energyFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
    borderRadius: 4,
  },
  barValueText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
    width: 44,
  },
  levelBadgeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(11, 14, 20, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelBadgeSubtitle: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  levelBadgeTitle: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  rightStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 14, 20, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  statChipText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  pauseButton: {
    backgroundColor: 'rgba(18, 22, 31, 0.85)',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  bossBarContainer: {
    marginTop: 10,
    alignSelf: 'center',
    width: '60%',
    backgroundColor: 'rgba(11, 14, 20, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 70, 0.4)',
  },
  bossHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bossNameText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  bossTitleText: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '600',
  },
  bossPhaseBadge: {
    color: THEME.colors.danger,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bossBarTrack: {
    width: '100%',
    height: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bossBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
