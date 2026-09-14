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
import { CosmeticItem, UpgradeItem, WalletState } from '../types/economy';
import { EconomyService } from '../services/economyService';
import { Navbar } from '../components/ui/Navbar';
import { audio } from '../services/audioService';

interface ShopScreenProps {
  wallet: WalletState;
  upgrades: UpgradeItem[];
  cosmetics: CosmeticItem[];
  playerLevel: number;
  onRefreshData: () => void;
  onBack: () => void;
  onAdminPress: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  wallet,
  upgrades,
  cosmetics,
  playerLevel,
  onRefreshData,
  onBack,
  onAdminPress,
}) => {
  const [activeTab, setActiveTab] = useState<'upgrades' | 'skins'>('upgrades');

  const handleUpgrade = async (item: UpgradeItem) => {
    const res = await EconomyService.purchaseUpgrade(item.id);
    if (res.success) {
      audio.playMoonSigil();
      onRefreshData();
    } else {
      Alert.alert('Notice', res.error || 'Cannot purchase upgrade');
    }
  };

  const handleCosmetic = async (item: CosmeticItem) => {
    const res = await EconomyService.interactCosmetic(item.id);
    if (res.success) {
      audio.playShard();
      onRefreshData();
    } else {
      Alert.alert('Notice', res.error || 'Cannot purchase item');
    }
  };

  return (
    <View style={styles.container}>
      <Navbar
        title="SHADOW FORGE"
        subtitle="VIRTUAL UPGRADES & SKINS"
        onBack={onBack}
        shards={wallet.shards}
        playerLevel={playerLevel}
        onAdminPress={onAdminPress}
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'upgrades' && styles.tabBtnActive]}
          onPress={() => {
            audio.playButton();
            setActiveTab('upgrades');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="flash"
            size={16}
            color={activeTab === 'upgrades' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'upgrades' && styles.tabBtnTextActive]}
          >
            STAT UPGRADES
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'skins' && styles.tabBtnActive]}
          onPress={() => {
            audio.playButton();
            setActiveTab('skins');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="shirt"
            size={16}
            color={activeTab === 'skins' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'skins' && styles.tabBtnTextActive]}
          >
            COSMETIC GEAR
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'upgrades' ? (
          <View style={styles.listContainer}>
            <Text style={styles.sectionHeader}>ENHANCE KAIRO'S ABILITIES</Text>

            {upgrades.map((item) => {
              const isMax = item.currentLevel >= item.maxLevel;
              const nextCost = !isMax ? item.costs[item.currentLevel] : 0;
              const canAfford = wallet.shards >= nextCost;
              const currentValue = item.levelValues[item.currentLevel - 1] || item.levelValues[0];
              const nextValue = !isMax ? item.levelValues[item.currentLevel] : 'MAX';

              return (
                <View key={item.id} style={styles.upgradeCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIconBox}>
                      <Ionicons name={item.icon as any} size={22} color={THEME.colors.primary} />
                    </View>
                    <View style={styles.cardTitleBox}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardDesc}>{item.description}</Text>
                    </View>
                  </View>

                  {/* Level Progress Indicator */}
                  <View style={styles.tierIndicatorRow}>
                    <Text style={styles.statLabelText}>{item.statLabel}:</Text>
                    <Text style={styles.statCurrentText}>{currentValue}</Text>
                    {!isMax && (
                      <>
                        <Ionicons name="arrow-forward" size={12} color={THEME.colors.textMuted} />
                        <Text style={styles.statNextText}>{nextValue}</Text>
                      </>
                    )}
                  </View>

                  <View style={styles.cardBottomRow}>
                    <View style={styles.tierBadge}>
                      <Text style={styles.tierBadgeText}>
                        RANK {item.currentLevel}/{item.maxLevel}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.buyBtn,
                        isMax && styles.buyBtnMax,
                        !canAfford && !isMax && styles.buyBtnDisabled,
                      ]}
                      disabled={isMax || !canAfford}
                      onPress={() => handleUpgrade(item)}
                      activeOpacity={0.8}
                    >
                      {isMax ? (
                        <Text style={styles.buyBtnTextMax}>MAX RANK</Text>
                      ) : (
                        <>
                          <Ionicons name="diamond" size={13} color="#05070a" />
                          <Text style={styles.buyBtnText}>{nextCost} SHARDS</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.sectionHeader}>NINJA SKINS & DASH TRAILS</Text>

            {cosmetics.map((cosmetic) => {
              const canAfford = wallet.shards >= cosmetic.cost;

              return (
                <View key={cosmetic.id} style={styles.cosmeticCard}>
                  <View style={styles.cosmeticPreviewBox}>
                    <View
                      style={[
                        styles.avatarColorDot,
                        {
                          backgroundColor: cosmetic.color,
                          borderColor: cosmetic.accentColor,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.cosmeticInfo}>
                    <View style={styles.cosmeticTitleRow}>
                      <Text style={styles.cosmeticName}>{cosmetic.name}</Text>
                      <Text
                        style={[
                          styles.rarityBadge,
                          {
                            color:
                              cosmetic.rarity === 'Legendary'
                                ? THEME.colors.gold
                                : cosmetic.rarity === 'Epic'
                                ? THEME.colors.voidPurple
                                : THEME.colors.primary,
                          },
                        ]}
                      >
                        {cosmetic.rarity}
                      </Text>
                    </View>
                    <Text style={styles.cosmeticDesc}>{cosmetic.description}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.cosmeticBtn,
                      cosmetic.equipped && styles.cosmeticBtnEquipped,
                      !cosmetic.unlocked && !canAfford && styles.buyBtnDisabled,
                    ]}
                    disabled={!cosmetic.unlocked && !canAfford}
                    onPress={() => handleCosmetic(cosmetic)}
                    activeOpacity={0.8}
                  >
                    {cosmetic.equipped ? (
                      <Text style={styles.cosmeticBtnEquippedText}>EQUIPPED</Text>
                    ) : cosmetic.unlocked ? (
                      <Text style={styles.cosmeticBtnEquipText}>EQUIP</Text>
                    ) : (
                      <>
                        <Ionicons name="diamond" size={12} color="#05070a" />
                        <Text style={styles.buyBtnText}>{cosmetic.cost}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.disclaimerText}>
          Virtual in-game upgrades only. No real money transactions or gambling mechanics.
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
  upgradeCard: {
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
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(72, 202, 228, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(72, 202, 228, 0.25)',
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    color: THEME.colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  cardDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  tierIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 8,
  },
  statLabelText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  statCurrentText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  statNextText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  tierBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tierBadgeText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyBtnMax: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  buyBtnDisabled: {
    opacity: 0.45,
  },
  buyBtnText: {
    color: '#05070a',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buyBtnTextMax: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  cosmeticCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 12,
  },
  cosmeticPreviewBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  cosmeticInfo: {
    flex: 1,
  },
  cosmeticTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cosmeticName: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  rarityBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cosmeticDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  cosmeticBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cosmeticBtnEquipped: {
    backgroundColor: 'rgba(72, 202, 228, 0.15)',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  cosmeticBtnEquippedText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  cosmeticBtnEquipText: {
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
