import React, { useEffect, useState } from 'react';
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
import { ECONOMY_CONFIG } from '../constants/economyConfig';
import { StorageService } from '../services/storageService';
import { EconomyService } from '../services/economyService';
import { Navbar } from '../components/ui/Navbar';
import { audio } from '../services/audioService';

interface AdminScreenProps {
  shards: number;
  playerLevel: number;
  onRefreshData: () => void;
  onUnlockAllLevels: () => void;
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  shards,
  playerLevel,
  onRefreshData,
  onUnlockAllLevels,
  onBack,
}) => {
  const [auditLogs, setAuditLogs] = useState<string[]>([]);

  useEffect(() => {
    StorageService.getAuditLogs().then(setAuditLogs);
  }, []);

  const handleGrantShards = async (amount: number) => {
    await EconomyService.addVirtualShards(
      amount,
      'Admin Virtual Grant',
      `Granted for balance tuning and testing`,
      'admin_grant'
    );
    audio.playMoonSigil();
    onRefreshData();
    StorageService.getAuditLogs().then(setAuditLogs);
    Alert.alert('Granted', `+${amount} Virtual Shadow Shards credited.`);
  };

  const handleGrantXp = async (amount: number) => {
    await EconomyService.addXp(amount);
    audio.playVictory();
    onRefreshData();
    StorageService.getAuditLogs().then(setAuditLogs);
    Alert.alert('Granted', `+${amount} Ninja XP awarded.`);
  };

  const handleUnlockAll = () => {
    onUnlockAllLevels();
    audio.playVictory();
    Alert.alert('Unlocked', 'All World 1 levels marked completed with 3 stars.');
  };

  return (
    <View style={styles.container}>
      <Navbar
        title="ADMIN PORTAL"
        subtitle="TUNING & TEST TOOLS"
        onBack={onBack}
        shards={shards}
        playerLevel={playerLevel}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Test Grants */}
        <Text style={styles.sectionHeader}>TEST CREDITS & PROGRESSION</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            Grant virtual in-game currencies to test upgrades, double jump unlock, skins, and
            level curves.
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnShards]}
              onPress={() => handleGrantShards(1000)}
              activeOpacity={0.8}
            >
              <Ionicons name="diamond" size={16} color="#05070a" />
              <Text style={styles.btnShardsText}>+1,000 SHARDS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnXp]}
              onPress={() => handleGrantXp(2500)}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={16} color="#ffffff" />
              <Text style={styles.btnXpText}>+2,500 XP</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, styles.btnUnlock]}
            onPress={handleUnlockAll}
            activeOpacity={0.8}
          >
            <Ionicons name="key" size={16} color="#05070a" />
            <Text style={styles.btnUnlockText}>UNLOCK ALL WORLD 1 LEVELS (3★)</Text>
          </TouchableOpacity>
        </View>

        {/* Economy Configuration Viewer */}
        <Text style={styles.sectionHeader}>ECONOMY CONFIGURATION (READ-ONLY)</Text>
        <View style={styles.card}>
          <View style={styles.configRow}>
            <Text style={styles.configKey}>Currency Name:</Text>
            <Text style={styles.configVal}>{ECONOMY_CONFIG.CURRENCY_NAME}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configKey}>Enemy Base Kill:</Text>
            <Text style={styles.configVal}>+{ECONOMY_CONFIG.REWARDS.ENEMY_DEFEAT_GUARD} Shards</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configKey}>Shard Pickup:</Text>
            <Text style={styles.configVal}>+{ECONOMY_CONFIG.REWARDS.SHARD_PICKUP} Shards</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configKey}>Moon Sigil Cache:</Text>
            <Text style={styles.configVal}>+{ECONOMY_CONFIG.REWARDS.MOON_SIGIL} Shards</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configKey}>Level Clear Base:</Text>
            <Text style={styles.configVal}>
              +{ECONOMY_CONFIG.REWARDS.LEVEL_CLEAR_BASE_SHARDS} Shards / +{ECONOMY_CONFIG.REWARDS.LEVEL_CLEAR_BASE_XP} XP
            </Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configKey}>3-Star Perfect Bonus:</Text>
            <Text style={styles.configVal}>
              +{ECONOMY_CONFIG.REWARDS.THREE_STAR_BONUS_SHARDS} Shards / +{ECONOMY_CONFIG.REWARDS.THREE_STAR_BONUS_XP} XP
            </Text>
          </View>
          <View style={[styles.configRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.configKey}>Boss Victory Drop:</Text>
            <Text style={[styles.configVal, { color: THEME.colors.gold }]}>
              +{ECONOMY_CONFIG.REWARDS.BOSS_DEFEAT} Shards
            </Text>
          </View>
        </View>

        {/* Live Audit Log */}
        <Text style={styles.sectionHeader}>SYSTEM AUDIT LOGS</Text>
        <View style={styles.card}>
          {auditLogs.length === 0 ? (
            <Text style={styles.emptyLogText}>No audit records yet.</Text>
          ) : (
            auditLogs.slice(0, 15).map((log, idx) => (
              <Text key={idx} style={styles.logText}>
                {log}
              </Text>
            ))
          )}
        </View>

        <Text style={styles.disclaimerText}>
          {ECONOMY_CONFIG.DISCLAIMER}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 10,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    padding: 16,
    marginBottom: 14,
  },
  cardDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnShards: {
    backgroundColor: THEME.colors.primary,
  },
  btnShardsText: {
    color: '#05070a',
    fontSize: 12,
    fontWeight: '800',
  },
  btnXp: {
    backgroundColor: THEME.colors.voidPurple,
  },
  btnXpText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  btnUnlock: {
    backgroundColor: THEME.colors.gold,
  },
  btnUnlockText: {
    color: '#05070a',
    fontSize: 12,
    fontWeight: '800',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  configKey: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  configVal: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyLogText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  logText: {
    color: THEME.colors.moonlight,
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  disclaimerText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 15,
  },
});
