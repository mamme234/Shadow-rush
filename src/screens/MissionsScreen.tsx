import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../constants/theme';
import { DailyLoginReward, Mission } from '../types/progress';
import { MissionService } from '../services/missionService';
import { Navbar } from '../components/ui/Navbar';
import { audio } from '../services/audioService';

interface MissionsScreenProps {
  missions: Mission[];
  dailyLogin: DailyLoginReward[];
  shards: number;
  playerLevel: number;
  onRefreshData: () => void;
  onBack: () => void;
  onAdminPress: () => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({
  missions,
  dailyLogin,
  shards,
  playerLevel,
  onRefreshData,
  onBack,
  onAdminPress,
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'daily_login'>('missions');

  const handleClaimMission = async (missionId: string) => {
    const res = await MissionService.claimMission(missionId);
    if (res.success) {
      audio.playVictory();
      onRefreshData();
    } else {
      Alert.alert('Notice', res.error || 'Cannot claim mission');
    }
  };

  const handleClaimLogin = async (day: number) => {
    const res = await MissionService.claimDailyLogin(day);
    if (res.success) {
      audio.playVictory();
      onRefreshData();
    } else {
      Alert.alert('Notice', res.error || 'Cannot claim daily reward');
    }
  };

  return (
    <View style={styles.container}>
      <Navbar
        title="MISSIONS & CALENDAR"
        subtitle="VIRTUAL REWARDS"
        onBack={onBack}
        shards={shards}
        playerLevel={playerLevel}
        onAdminPress={onAdminPress}
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'missions' && styles.tabBtnActive]}
          onPress={() => {
            audio.playButton();
            setActiveTab('missions');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="list"
            size={16}
            color={activeTab === 'missions' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'missions' && styles.tabBtnTextActive]}
          >
            DAILY MISSIONS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'daily_login' && styles.tabBtnActive]}
          onPress={() => {
            audio.playButton();
            setActiveTab('daily_login');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="calendar"
            size={16}
            color={activeTab === 'daily_login' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'daily_login' && styles.tabBtnTextActive]}
          >
            7-DAY DEVOTION
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'missions' ? (
          <View style={styles.listContainer}>
            <Text style={styles.sectionHeader}>ACTIVE SHADOW PURGE OBJECTIVES</Text>

            {missions.map((m) => {
              const progressPct = Math.min(100, Math.round((m.current / m.target) * 100));

              return (
                <View key={m.id} style={styles.missionCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                      <Ionicons name={m.icon as any} size={20} color={THEME.colors.primary} />
                    </View>
                    <View style={styles.missionInfo}>
                      <Text style={styles.missionTitle}>{m.title}</Text>
                      <Text style={styles.missionDesc}>{m.description}</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressValue}>
                        {m.current} / {m.target}
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                    </View>
                  </View>

                  {/* Rewards & Action */}
                  <View style={styles.cardFooter}>
                    <View style={styles.rewardBadges}>
                      <View style={styles.rewardChip}>
                        <Ionicons name="diamond" size={12} color={THEME.colors.primary} />
                        <Text style={styles.rewardChipText}>+{m.rewardShards}</Text>
                      </View>
                      <View style={[styles.rewardChip, styles.xpChip]}>
                        <Ionicons name="sparkles" size={12} color={THEME.colors.xp} />
                        <Text style={[styles.rewardChipText, { color: THEME.colors.xp }]}>
                          +{m.rewardXp} XP
                        </Text>
                      </View>
                    </View>

                    {m.claimed ? (
                      <View style={styles.claimedBadge}>
                        <Ionicons name="checkmark-done" size={14} color={THEME.colors.textMuted} />
                        <Text style={styles.claimedText}>CLAIMED</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.claimBtn, !m.completed && styles.claimBtnDisabled]}
                        disabled={!m.completed}
                        onPress={() => handleClaimMission(m.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.claimBtnText}>
                          {m.completed ? 'CLAIM REWARD' : 'IN PROGRESS'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.sectionHeader}>7-DAY CONSECUTIVE DEVOTION CALENDAR</Text>

            <View style={styles.calendarGrid}>
              {dailyLogin.map((day) => {
                return (
                  <View
                    key={day.day}
                    style={[
                      styles.calendarDayCard,
                      day.claimed && styles.calendarDayClaimed,
                      day.day === 7 && styles.day7Card,
                    ]}
                  >
                    <View style={styles.calHeaderRow}>
                      <Text style={styles.calDayText}>DAY {day.day}</Text>
                      {day.claimed && (
                        <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} />
                      )}
                    </View>

                    <Text style={styles.calBonusTitle}>{day.bonusTitle}</Text>

                    <View style={styles.calRewards}>
                      <View style={styles.calRewardRow}>
                        <Ionicons name="diamond" size={12} color={THEME.colors.primary} />
                        <Text style={styles.calShardsText}>+{day.shards}</Text>
                      </View>
                      <View style={styles.calRewardRow}>
                        <Ionicons name="sparkles" size={12} color={THEME.colors.xp} />
                        <Text style={styles.calXpText}>+{day.xp} XP</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.calClaimBtn, day.claimed && styles.calClaimBtnClaimed]}
                      disabled={day.claimed}
                      onPress={() => handleClaimLogin(day.day)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.calClaimBtnText}>
                        {day.claimed ? 'CLAIMED' : 'CLAIM'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <Text style={styles.disclaimerText}>
          All virtual mission rewards credit directly to your Shadow Wallet.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.surface,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: THEME.colors.surfaceLight,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  tabBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(72, 202, 228, 0.12)',
  },
  tabBtnText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabBtnTextActive: {
    color: THEME.colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 12,
  },
  sectionHeader: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  missionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(72, 202, 228, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  missionDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  progressSection: {
    marginTop: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  progressValue: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  rewardBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  xpChip: {
    backgroundColor: 'rgba(160, 108, 213, 0.15)',
  },
  rewardChipText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  claimBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  claimBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  claimBtnText: {
    color: '#05070a',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  calendarGrid: {
    gap: 10,
  },
  calendarDayCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarDayClaimed: {
    opacity: 0.6,
  },
  day7Card: {
    borderColor: 'rgba(252, 163, 17, 0.4)',
    backgroundColor: 'rgba(35, 26, 15, 0.6)',
  },
  calHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 70,
  },
  calDayText: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  calBonusTitle: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    flex: 1,
    paddingHorizontal: 10,
  },
  calRewards: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 12,
  },
  calRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calShardsText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  calXpText: {
    color: THEME.colors.xp,
    fontSize: 12,
    fontWeight: '800',
  },
  calClaimBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  calClaimBtnClaimed: {
    backgroundColor: 'transparent',
  },
  calClaimBtnText: {
    color: '#05070a',
    fontSize: 11,
    fontWeight: '800',
  },
  disclaimerText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
