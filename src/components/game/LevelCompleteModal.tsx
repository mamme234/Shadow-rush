import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../../constants/theme';
import { audio } from '../../services/audioService';

interface LevelCompleteModalProps {
  visible: boolean;
  levelTitle: string;
  levelNumber: number;
  stars: number;
  timeSeconds: number;
  shardsEarned: number;
  score: number;
  xpEarned: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onWorldMap: () => void;
  hasNextLevel: boolean;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  visible,
  levelTitle,
  levelNumber,
  stars,
  timeSeconds,
  shardsEarned,
  score,
  xpEarned,
  onNextLevel,
  onReplay,
  onWorldMap,
  hasNextLevel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.headerSubtitle}>SHADOW VICTORY</Text>
          <Text style={styles.headerTitle}>LEVEL {levelNumber} CLEARED</Text>
          <Text style={styles.levelName}>{levelTitle}</Text>

          {/* Star Rating */}
          <View style={styles.starsRow}>
            {[1, 2, 3].map((starNum) => (
              <Ionicons
                key={starNum}
                name={starNum <= stars ? 'star' : 'star-outline'}
                size={34}
                color={starNum <= stars ? THEME.colors.gold : THEME.colors.textMuted}
                style={styles.starIcon}
              />
            ))}
          </View>

          {/* Stats Breakdown */}
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statLabelRow}>
                <Ionicons name="time" size={16} color={THEME.colors.primary} />
                <Text style={styles.statLabel}>Completion Time</Text>
              </View>
              <Text style={styles.statValue}>{timeSeconds}s</Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statLabelRow}>
                <Ionicons name="diamond" size={16} color={THEME.colors.primary} />
                <Text style={styles.statLabel}>Shadow Shards</Text>
              </View>
              <Text style={[styles.statValue, { color: THEME.colors.primary }]}>
                +{shardsEarned}
              </Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statLabelRow}>
                <Ionicons name="sparkles" size={16} color={THEME.colors.xp} />
                <Text style={styles.statLabel}>Ninja XP</Text>
              </View>
              <Text style={[styles.statValue, { color: THEME.colors.xp }]}>
                +{xpEarned} XP
              </Text>
            </View>

            <View style={[styles.statRow, styles.totalScoreRow]}>
              <View style={styles.statLabelRow}>
                <Ionicons name="trophy" size={16} color={THEME.colors.gold} />
                <Text style={[styles.statLabel, { fontWeight: '700' }]}>Total Score</Text>
              </View>
              <Text style={[styles.statValue, styles.scoreValue]}>{score}</Text>
            </View>
          </View>

          <Text style={styles.disclaimerText}>
            Virtual rewards credited to your Shadow Wallet.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {hasNextLevel ? (
              <TouchableOpacity
                style={[styles.btn, styles.btnNext]}
                onPress={() => {
                  audio.playButton();
                  onNextLevel();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-forward" size={18} color="#05070a" />
                <Text style={styles.btnNextText}>NEXT LEVEL</Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.secondaryBtnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => {
                  audio.playButton();
                  onReplay();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color={THEME.colors.white} />
                <Text style={styles.btnSecondaryText}>REPLAY</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => {
                  audio.playButton();
                  onWorldMap();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="map" size={16} color={THEME.colors.white} />
                <Text style={styles.btnSecondaryText}>WORLD MAP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: THEME.colors.modalOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '92%',
    maxWidth: 400,
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(72, 202, 228, 0.4)',
    shadowColor: '#48cae4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  headerSubtitle: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerTitle: {
    color: THEME.colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  levelName: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  starIcon: {
    shadowColor: '#fca311',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  statsCard: {
    width: '100%',
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalScoreRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  statValue: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  scoreValue: {
    color: THEME.colors.gold,
    fontSize: 16,
    fontWeight: '800',
  },
  disclaimerText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnNext: {
    backgroundColor: THEME.colors.primary,
  },
  btnNextText: {
    color: '#05070a',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceLight,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  btnSecondaryText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
