import React from 'react';
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
import { WalletState } from '../types/economy';
import { audio } from '../services/audioService';

interface MainMenuScreenProps {
  profile: PlayerProfile;
  wallet: WalletState;
  onNavigate: (
    screen:
      | 'game'
      | 'world_map'
      | 'shop'
      | 'missions'
      | 'profile'
      | 'achievements'
      | 'leaderboard'
      | 'story'
      | 'settings'
      | 'admin'
  ) => void;
  onQuickPlay: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  profile,
  wallet,
  onNavigate,
  onQuickPlay,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.profileChip}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={16} color={THEME.colors.primary} />
          </View>
          <View>
            <Text style={styles.usernameText}>{profile.username}</Text>
            <Text style={styles.titleText}>{profile.title}</Text>
          </View>
        </View>

        <View style={styles.headerRightStats}>
          {/* Virtual Shards */}
          <TouchableOpacity
            style={styles.currencyBadge}
            onPress={() => onNavigate('profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="diamond" size={15} color={THEME.colors.primary} />
            <Text style={styles.currencyValue}>{wallet.shards}</Text>
            <Text style={styles.currencyLabel}>SHARDS</Text>
          </TouchableOpacity>

          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>LV.{profile.level}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Branding Section */}
        <View style={styles.heroSection}>
          <View style={styles.moonGlowBackdrop} />

          {/* Logo Title */}
          <View style={styles.logoContainer}>
            <View style={styles.bladeIconRow}>
              <Ionicons name="flash" size={24} color={THEME.colors.primary} />
              <Ionicons name="moon" size={28} color={THEME.colors.primary} />
              <Ionicons name="flash" size={24} color={THEME.colors.crimson} />
            </View>
            <Text style={styles.gameTitle}>SHADOW RUSH</Text>
            <Text style={styles.gameTagline}>
              MASTER THE SHADOW. CONQUER THE NIGHT.
            </Text>
          </View>

          {/* Big PLAY CTA Button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              audio.playButton();
              onQuickPlay();
            }}
            activeOpacity={0.85}
          >
            <View style={styles.playButtonInner}>
              <Ionicons name="play" size={24} color="#05070a" />
              <Text style={styles.playButtonText}>ENTER REALM</Text>
            </View>
            <Text style={styles.playButtonSub}>RESUME MOONLIT FOREST</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Grid */}
        <View style={styles.menuGrid}>
          {/* World Map */}
          <TouchableOpacity
            style={[styles.menuCard, styles.menuCardHighlight]}
            onPress={() => {
              audio.playButton();
              onNavigate('world_map');
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.menuCardIconBg, { backgroundColor: 'rgba(72, 202, 228, 0.15)' }]}>
              <Ionicons name="map" size={24} color={THEME.colors.primary} />
            </View>
            <View style={styles.menuCardTextCol}>
              <Text style={styles.menuCardTitle}>WORLD MAP</Text>
              <Text style={styles.menuCardDesc}>Explore 5 Sacred Realms</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* Missions & Daily Login */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => {
              audio.playButton();
              onNavigate('missions');
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.menuCardIconBg, { backgroundColor: 'rgba(252, 163, 17, 0.15)' }]}>
              <Ionicons name="calendar" size={24} color={THEME.colors.gold} />
            </View>
            <View style={styles.menuCardTextCol}>
              <Text style={styles.menuCardTitle}>MISSIONS & LOGIN</Text>
              <Text style={styles.menuCardDesc}>Daily Bounties & 7-Day Rewards</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* Shop & Upgrades */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => {
              audio.playButton();
              onNavigate('shop');
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.menuCardIconBg, { backgroundColor: 'rgba(230, 57, 70, 0.15)' }]}>
              <Ionicons name="bag" size={24} color={THEME.colors.crimson} />
            </View>
            <View style={styles.menuCardTextCol}>
              <Text style={styles.menuCardTitle}>UPGRADES & SHOP</Text>
              <Text style={styles.menuCardDesc}>Stats, Double Jump & Ninja Skins</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* Story & Lore */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => {
              audio.playButton();
              onNavigate('story');
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.menuCardIconBg, { backgroundColor: 'rgba(114, 9, 183, 0.15)' }]}>
              <Ionicons name="book" size={24} color={THEME.colors.voidPurple} />
            </View>
            <View style={styles.menuCardTextCol}>
              <Text style={styles.menuCardTitle}>STORY CHRONICLES</Text>
              <Text style={styles.menuCardDesc}>Kairo & The Hollow Awakening</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* Profile & Wallet */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => {
              audio.playButton();
              onNavigate('profile');
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.menuCardIconBg, { backgroundColor: 'rgba(160, 108, 213, 0.15)' }]}>
              <Ionicons name="wallet" size={24} color={THEME.colors.xp} />
            </View>
            <View style={styles.menuCardTextCol}>
              <Text style={styles.menuCardTitle}>PROFILE & WALLET</Text>
              <Text style={styles.menuCardDesc}>Stats, Records & Ledger</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* Achievements */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => {
              audio.playButton();
              onNavigate('achievements');
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.menuCardIconBg, { backgroundColor: 'rgba(72, 202, 228, 0.15)' }]}>
              <Ionicons name="trophy" size={24} color={THEME.colors.primary} />
            </View>
            <View style={styles.menuCardTextCol}>
              <Text style={styles.menuCardTitle}>ACHIEVEMENTS</Text>
              <Text style={styles.menuCardDesc}>Trophies & Feats of Agility</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* Leaderboard */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => {
              audio.playButton();
              onNavigate('leaderboard');
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.menuCardIconBg, { backgroundColor: 'rgba(252, 163, 17, 0.15)' }]}>
              <Ionicons name="podium" size={24} color={THEME.colors.gold} />
            </View>
            <View style={styles.menuCardTextCol}>
              <Text style={styles.menuCardTitle}>LEADERBOARD</Text>
              <Text style={styles.menuCardDesc}>High Scores & Speedrun Times</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => {
              audio.playButton();
              onNavigate('settings');
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.menuCardIconBg, { backgroundColor: 'rgba(141, 153, 174, 0.15)' }]}>
              <Ionicons name="settings" size={24} color={THEME.colors.textSecondary} />
            </View>
            <View style={styles.menuCardTextCol}>
              <Text style={styles.menuCardTitle}>SETTINGS</Text>
              <Text style={styles.menuCardDesc}>Audio, Controls & Display</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Footer Admin Shortcut */}
        <TouchableOpacity
          style={styles.adminFooterBtn}
          onPress={() => {
            audio.playButton();
            onNavigate('admin');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="construct-outline" size={14} color={THEME.colors.textMuted} />
          <Text style={styles.adminFooterText}>DEV & ADMIN PORTAL</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Shadow Shards are strictly virtual in-game rewards with NO real-world cash value.
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
  topHeader: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.surface,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
  },
  usernameText: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  titleText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerRightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(72, 202, 228, 0.3)',
    gap: 5,
  },
  currencyValue: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  currencyLabel: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  levelBadge: {
    backgroundColor: 'rgba(160, 108, 213, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(160, 108, 213, 0.4)',
  },
  levelBadgeText: {
    color: THEME.colors.xp,
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  moonGlowBackdrop: {
    position: 'absolute',
    top: 10,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(72, 202, 228, 0.08)',
    filter: 'blur(30px)' as any,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bladeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: THEME.colors.white,
    letterSpacing: 3,
    textShadowColor: 'rgba(72, 202, 228, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  gameTagline: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 2,
    marginTop: 6,
    textAlign: 'center',
  },
  playButton: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#48cae4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#90e0ef',
  },
  playButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButtonText: {
    color: '#05070a',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  playButtonSub: {
    color: '#05070a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 2,
    opacity: 0.85,
  },
  menuGrid: {
    paddingHorizontal: 16,
    gap: 10,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  menuCardHighlight: {
    borderColor: 'rgba(72, 202, 228, 0.4)',
    backgroundColor: 'rgba(18, 22, 31, 0.9)',
  },
  menuCardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuCardTextCol: {
    flex: 1,
  },
  menuCardTitle: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  menuCardDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  adminFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    paddingVertical: 10,
  },
  adminFooterText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  disclaimerText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 24,
  },
});
