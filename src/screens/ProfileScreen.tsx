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
import { WalletState } from '../types/economy';
import { PlayerProfile } from '../types/progress';
import { Navbar } from '../components/ui/Navbar';
import { audio } from '../services/audioService';

interface ProfileScreenProps {
  profile: PlayerProfile;
  wallet: WalletState;
  onBack: () => void;
  onAdminPress: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  wallet,
  onBack,
  onAdminPress,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>('profile');

  const xpPercent = Math.min(100, Math.round((profile.xp / profile.nextLevelXp) * 100));

  return (
    <View style={styles.container}>
      <Navbar
        title="SHINOBI SANCTUM"
        subtitle="PROFILE & WALLET LEDGER"
        onBack={onBack}
        shards={wallet.shards}
        playerLevel={profile.level}
        onAdminPress={onAdminPress}
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'profile' && styles.tabBtnActive]}
          onPress={() => {
            audio.playButton();
            setActiveTab('profile');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="person"
            size={16}
            color={activeTab === 'profile' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'profile' && styles.tabBtnTextActive]}
          >
            SHINOBI PROFILE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'wallet' && styles.tabBtnActive]}
          onPress={() => {
            audio.playButton();
            setActiveTab('wallet');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="wallet"
            size={16}
            color={activeTab === 'wallet' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'wallet' && styles.tabBtnTextActive]}
          >
            VIRTUAL WALLET
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' ? (
          <>
            {/* Profile Hero Card */}
            <View style={styles.profileHeroCard}>
              <View style={styles.avatarLarge}>
                <Ionicons name="moon" size={36} color={THEME.colors.primary} />
              </View>
              <Text style={styles.heroName}>{profile.username}</Text>
              <Text style={styles.heroTitle}>{profile.title}</Text>

              {/* XP Progress Bar */}
              <View style={styles.xpProgressContainer}>
                <View style={styles.xpRow}>
                  <Text style={styles.xpLabel}>Level {profile.level} Progress</Text>
                  <Text style={styles.xpNumbers}>
                    {profile.xp} / {profile.nextLevelXp} XP ({xpPercent}%)
                  </Text>
                </View>
                <View style={styles.xpTrack}>
                  <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
                </View>
              </View>
            </View>

            {/* Lifetime Stats Grid */}
            <Text style={styles.sectionHeader}>COMBAT & EXPLORATION RECORDS</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="trophy" size={20} color={THEME.colors.gold} />
                <Text style={styles.statBoxValue}>{profile.totalScore}</Text>
                <Text style={styles.statBoxLabel}>Total Score</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="star" size={20} color={THEME.colors.gold} />
                <Text style={styles.statBoxValue}>{profile.starsEarned}</Text>
                <Text style={styles.statBoxLabel}>Stars Gathered</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="map" size={20} color={THEME.colors.primary} />
                <Text style={styles.statBoxValue}>{profile.levelsCleared}</Text>
                <Text style={styles.statBoxLabel}>Levels Cleared</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="skull" size={20} color={THEME.colors.crimson} />
                <Text style={styles.statBoxValue}>{profile.totalEnemiesDefeated}</Text>
                <Text style={styles.statBoxLabel}>Enemies Purged</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="flame" size={20} color={THEME.colors.danger} />
                <Text style={styles.statBoxValue}>{profile.totalBossesDefeated}</Text>
                <Text style={styles.statBoxLabel}>Bosses Slain</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="eye" size={20} color={THEME.colors.voidPurple} />
                <Text style={styles.statBoxValue}>{profile.totalSecretsFound}</Text>
                <Text style={styles.statBoxLabel}>Secrets Found</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Wallet Overview Banner */}
            <View style={styles.walletBanner}>
              <View style={styles.walletBalanceRow}>
                <View>
                  <Text style={styles.walletLabel}>CURRENT BALANCE</Text>
                  <View style={styles.walletBalanceValRow}>
                    <Ionicons name="diamond" size={24} color={THEME.colors.primary} />
                    <Text style={styles.walletBalanceNum}>{wallet.shards}</Text>
                    <Text style={styles.walletCurrencyName}>SHARDS</Text>
                  </View>
                </View>
                <View style={styles.virtualCurrencyBadge}>
                  <Text style={styles.virtualBadgeText}>VIRTUAL CURRENCY</Text>
                </View>
              </View>

              <View style={styles.walletTotalsRow}>
                <View style={styles.walletTotalCol}>
                  <Text style={styles.walletTotalSub}>LIFETIME EARNED</Text>
                  <Text style={styles.walletTotalEarned}>+{wallet.lifetimeEarned}</Text>
                </View>
                <View style={styles.walletTotalCol}>
                  <Text style={styles.walletTotalSub}>LIFETIME SPENT</Text>
                  <Text style={styles.walletTotalSpent}>-{wallet.lifetimeSpent}</Text>
                </View>
              </View>
            </View>

            {/* Transaction Ledger */}
            <Text style={styles.sectionHeader}>TRANSACTION LEDGER HISTORY</Text>
            <View style={styles.transactionsList}>
              {wallet.transactions.map((tx) => {
                const isEarned = tx.amount > 0;

                return (
                  <View key={tx.id} style={styles.txRow}>
                    <View
                      style={[
                        styles.txIconBox,
                        isEarned ? styles.txEarnedIconBox : styles.txSpentIconBox,
                      ]}
                    >
                      <Ionicons
                        name={isEarned ? 'arrow-down' : 'arrow-up'}
                        size={16}
                        color={isEarned ? THEME.colors.primary : THEME.colors.crimson}
                      />
                    </View>

                    <View style={styles.txInfo}>
                      <Text style={styles.txTitle}>{tx.title}</Text>
                      <Text style={styles.txDesc}>{tx.description}</Text>
                    </View>

                    <View style={styles.txAmountCol}>
                      <Text
                        style={[
                          styles.txAmountText,
                          isEarned ? styles.txAmountEarned : styles.txAmountSpent,
                        ]}
                      >
                        {isEarned ? `+${tx.amount}` : tx.amount}
                      </Text>
                      <Text style={styles.txBalanceAfter}>Bal: {tx.balanceAfter}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.disclaimerText}>
          Shadow Shards are ONLY virtual in-game rewards with NO real-world monetary value.
          They cannot be withdrawn, transferred for money, or converted to cash.
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
  profileHeroCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: 20,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(72, 202, 228, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    marginBottom: 10,
  },
  heroName: {
    color: THEME.colors.white,
    fontSize: 20,
    fontWeight: '900',
  },
  heroTitle: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
    marginBottom: 14,
  },
  xpProgressContainer: {
    width: '100%',
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  xpLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  xpNumbers: {
    color: THEME.colors.xp,
    fontSize: 11,
    fontWeight: '700',
  },
  xpTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: THEME.colors.xp,
  },
  sectionHeader: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: 'center',
  },
  statBoxValue: {
    color: THEME.colors.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  statBoxLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  walletBanner: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(72, 202, 228, 0.3)',
    marginBottom: 20,
  },
  walletBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  walletLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  walletBalanceValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  walletBalanceNum: {
    color: THEME.colors.white,
    fontSize: 26,
    fontWeight: '900',
  },
  walletCurrencyName: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  virtualCurrencyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  virtualBadgeText: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  walletTotalsRow: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  walletTotalCol: {
    flex: 1,
  },
  walletTotalSub: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  walletTotalEarned: {
    color: THEME.colors.primary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  walletTotalSpent: {
    color: THEME.colors.crimson,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  transactionsList: {
    gap: 8,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 10,
  },
  txIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txEarnedIconBox: {
    backgroundColor: 'rgba(72, 202, 228, 0.15)',
  },
  txSpentIconBox: {
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  txDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  txAmountEarned: {
    color: THEME.colors.primary,
  },
  txAmountSpent: {
    color: THEME.colors.crimson,
  },
  txBalanceAfter: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  disclaimerText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 15,
  },
});
