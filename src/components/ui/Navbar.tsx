import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../../constants/theme';
import { audio } from '../../services/audioService';

interface NavbarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  shards: number;
  playerLevel: number;
  onAdminPress?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  onBack,
  shards,
  playerLevel,
  onAdminPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Left: Back button or Logo icon */}
      <View style={styles.leftGroup}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              audio.playButton();
              onBack();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={THEME.colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <Ionicons name="moon" size={16} color={THEME.colors.primary} />
          </View>
        )}

        <View style={styles.titleColumn}>
          <Text style={styles.titleText}>{title}</Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      </View>

      {/* Right: Currency & Level Badges */}
      <View style={styles.rightGroup}>
        {/* Virtual Shards */}
        <View style={styles.currencyBadge}>
          <Ionicons name="diamond" size={14} color={THEME.colors.primary} />
          <Text style={styles.currencyText}>{shards}</Text>
        </View>

        {/* Player Level */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LV.{playerLevel}</Text>
        </View>

        {/* Admin Shortcut */}
        {onAdminPress && (
          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => {
              audio.playButton();
              onAdminPress();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="construct" size={15} color={THEME.colors.gold} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: THEME.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    zIndex: 50,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(72, 202, 228, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    justifyContent: 'center',
  },
  titleText: {
    color: THEME.colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitleText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(72, 202, 228, 0.3)',
    gap: 4,
  },
  currencyText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  levelBadge: {
    backgroundColor: 'rgba(160, 108, 213, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(160, 108, 213, 0.4)',
  },
  levelText: {
    color: THEME.colors.xp,
    fontSize: 12,
    fontWeight: '800',
  },
  adminBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(252, 163, 17, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(252, 163, 17, 0.3)',
  },
});
