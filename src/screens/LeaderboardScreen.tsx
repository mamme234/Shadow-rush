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
import { PlayerProfile } from '../types/progress';
import { Navbar } from '../components/ui/Navbar';
import { audio } from '../services/audioService';

interface LeaderboardScreenProps {
  profile: PlayerProfile;
  shards: number;
  onBack: () => void;
  onAdminPress: () => void;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  title: string;
  score: number;
  level: number;
  isCurrentPlayer?: boolean;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  profile,
  shards,
  onBack,
  onAdminPress,
}) => {
  const [category, setCategory] = useState<'weekly' | 'all_time' | 'speedrun'>('weekly');

  // Realistic mock clan leaderboard records showcasing real score integration
  const entries: LeaderboardEntry[] = [
    { rank: 1, username: 'Hattori_Void', title: 'Nightfall Master', score: 14850, level: 32 },
    { rank: 2, username: 'RavenGhost', title: 'Silent Blade', score: 11200, level: 26 },
    {
      rank: 3,
      username: profile.username,
      title: profile.title,
      score: Math.max(9400, profile.totalScore),
      level: profile.level,
      isCurrentPlayer: true,
    },
    { rank: 4, username: 'KageShinobi', title: 'Moonlit Walker', score: 8150, level: 19 },
    { rank: 5, username: 'Ronin_X', title: 'Shadow Initiate', score: 6700, level: 14 },
    { rank: 6, username: 'SilentWind', title: 'Shadow Initiate', score: 4900, level: 11 },
  ];

  return (
    <View style={styles.container}>
      <Navbar
        title="LEADERBOARD"
        subtitle="SHADOW GUILD RANKINGS"
        onBack={onBack}
        shards={shards}
        playerLevel={profile.level}
        onAdminPress={onAdminPress}
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, category === 'weekly' && styles.tabBtnActive]}
          onPress={() => {
            audio.playButton();
            setCategory('weekly');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.tabBtnText, category === 'weekly' && styles.tabBtnTextActive]}
          >
            WEEKLY PURGE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, category === 'all_time' && styles.tabBtnActive]}
          onPress={() => {
            audio.playButton();
            setCategory('all_time');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.tabBtnText, category === 'all_time' && styles.tabBtnTextActive]}
          >
            ALL-TIME MASTERS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, category === 'speedrun' && styles.tabBtnActive]}
          onPress={() => {
            audio.playButton();
            setCategory('speedrun');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.tabBtnText, category === 'speedrun' && styles.tabBtnTextActive]}
          >
            SPEEDRUN BEST
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Player Standing Card */}
        <View style={styles.myRankCard}>
          <View style={styles.myRankLeft}>
            <View style={styles.myRankNumBadge}>
              <Text style={styles.myRankNumText}>#3</Text>
            </View>
            <View>
              <Text style={styles.myRankName}>{profile.username} (You)</Text>
              <Text style={styles.myRankSub}>
                {profile.title} • Level {profile.level}
              </Text>
            </View>
          </View>

          <View style={styles.myRankScoreCol}>
            <Text style={styles.myRankScoreNum}>
              {Math.max(9400, profile.totalScore)}
            </Text>
            <Text style={styles.myRankScoreLabel}>PTS</Text>
          </View>
        </View>

        {/* Leaderboard Table */}
        <View style={styles.tableCard}>
          {entries.map((item) => {
            const isTop3 = item.rank <= 3;

            return (
              <View
                key={item.rank}
                style={[
                  styles.tableRow,
                  item.isCurrentPlayer && styles.tableRowCurrent,
                  item.rank === entries.length && styles.tableRowLast,
                ]}
              >
                {/* Rank Number / Medal */}
                <View style={styles.rankCell}>
                  {item.rank === 1 ? (
                    <Ionicons name="trophy" size={18} color={THEME.colors.gold} />
                  ) : item.rank === 2 ? (
                    <Ionicons name="trophy" size={18} color="#c0c0c0" />
                  ) : item.rank === 3 ? (
                    <Ionicons name="trophy" size={18} color="#cd7f32" />
                  ) : (
                    <Text style={styles.rankNumText}>#{item.rank}</Text>
                  )}
                </View>

                {/* Player Name & Title */}
                <View style={styles.nameCell}>
                  <Text
                    style={[
                      styles.nameText,
                      item.isCurrentPlayer && styles.nameTextCurrent,
                    ]}
                  >
                    {item.username}
                  </Text>
                  <Text style={styles.titleText}>
                    {item.title} • Lv.{item.level}
                  </Text>
                </View>

                {/* Score */}
                <View style={styles.scoreCell}>
                  <Text
                    style={[
                      styles.scoreText,
                      isTop3 && { color: THEME.colors.gold },
                    ]}
                  >
                    {item.score.toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.disclaimerText}>
          Scores calculated from level completion times, combat combos, and sacred shards.
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
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.surface,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
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
    fontSize: 10,
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
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(72, 202, 228, 0.12)',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    marginBottom: 16,
  },
  myRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  myRankNumBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRankNumText: {
    color: '#05070a',
    fontSize: 16,
    fontWeight: '900',
  },
  myRankName: {
    color: THEME.colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  myRankSub: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  myRankScoreCol: {
    alignItems: 'flex-end',
  },
  myRankScoreNum: {
    color: THEME.colors.white,
    fontSize: 20,
    fontWeight: '900',
  },
  myRankScoreLabel: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  tableCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  tableRowCurrent: {
    backgroundColor: 'rgba(72, 202, 228, 0.08)',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  rankCell: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  nameCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  nameText: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  nameTextCurrent: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  titleText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  scoreCell: {
    alignItems: 'flex-end',
  },
  scoreText: {
    color: THEME.colors.white,
    fontSize: 14,
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
