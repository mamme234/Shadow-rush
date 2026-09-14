import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../constants/theme';
import { Achievement } from '../types/progress';
import { Navbar } from '../components/ui/Navbar';

interface AchievementsScreenProps {
  achievements: Achievement[];
  shards: number;
  playerLevel: number;
  onBack: () => void;
  onAdminPress: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  achievements,
  shards,
  playerLevel,
  onBack,
  onAdminPress,
}) => {
  const completedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <View style={styles.container}>
      <Navbar
        title="SHINOBI FEATS"
        subtitle="ACHIEVEMENTS"
        onBack={onBack}
        shards={shards}
        playerLevel={playerLevel}
        onAdminPress={onAdminPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Ionicons name="trophy" size={32} color={THEME.colors.gold} />
          <View style={styles.summaryTextCol}>
            <Text style={styles.summaryTitle}>
              FEATS UNLOCKED: {completedCount} / {achievements.length}
            </Text>
            <Text style={styles.summaryDesc}>
              Complete rigorous ninja challenges to earn virtual Shards and XP.
            </Text>
          </View>
        </View>

        {/* Achievements List */}
        <View style={styles.listContainer}>
          {achievements.map((ach) => {
            const pct = Math.min(100, Math.round((ach.current / ach.target) * 100));

            return (
              <View
                key={ach.id}
                style={[styles.achCard, ach.unlocked && styles.achCardUnlocked]}
              >
                <View
                  style={[
                    styles.iconBox,
                    ach.unlocked ? styles.iconBoxUnlocked : styles.iconBoxLocked,
                  ]}
                >
                  <Ionicons
                    name={ach.icon as any}
                    size={22}
                    color={ach.unlocked ? THEME.colors.gold : THEME.colors.textMuted}
                  />
                </View>

                <View style={styles.achInfo}>
                  <View style={styles.achTitleRow}>
                    <Text style={styles.achTitle}>{ach.title}</Text>
                    {ach.unlocked ? (
                      <View style={styles.unlockedBadge}>
                        <Ionicons name="checkmark" size={12} color={THEME.colors.primary} />
                        <Text style={styles.unlockedBadgeText}>UNLOCKED</Text>
                      </View>
                    ) : (
                      <Text style={styles.progressText}>
                        {ach.current} / {ach.target}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.achDesc}>{ach.description}</Text>

                  {/* Progress bar if not unlocked */}
                  {!ach.unlocked && (
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${pct}%` }]} />
                    </View>
                  )}

                  {/* Rewards */}
                  <View style={styles.rewardsRow}>
                    <View style={styles.rewardChip}>
                      <Ionicons name="diamond" size={12} color={THEME.colors.primary} />
                      <Text style={styles.rewardText}>+{ach.rewardShards} Shards</Text>
                    </View>
                    <View style={styles.rewardChip}>
                      <Ionicons name="sparkles" size={12} color={THEME.colors.xp} />
                      <Text style={[styles.rewardText, { color: THEME.colors.xp }]}>
                        +{ach.rewardXp} XP
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
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
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(252, 163, 17, 0.3)',
    marginBottom: 16,
    gap: 14,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryTitle: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  listContainer: {
    gap: 10,
  },
  achCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 12,
  },
  achCardUnlocked: {
    borderColor: 'rgba(72, 202, 228, 0.4)',
    backgroundColor: 'rgba(18, 26, 36, 0.85)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUnlocked: {
    backgroundColor: 'rgba(252, 163, 17, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 163, 17, 0.35)',
  },
  iconBoxLocked: {
    backgroundColor: THEME.colors.surfaceLight,
  },
  achInfo: {
    flex: 1,
  },
  achTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achTitle: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  progressText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(72, 202, 228, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  unlockedBadgeText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  achDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  track: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  fill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rewardText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});
