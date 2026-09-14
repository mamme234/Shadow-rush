import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../constants/theme';
import { GameSettings } from '../types/progress';
import { StorageService } from '../services/storageService';
import { audio } from '../services/audioService';
import { Navbar } from '../components/ui/Navbar';

interface SettingsScreenProps {
  settings: GameSettings;
  shards: number;
  playerLevel: number;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetAllData: () => void;
  onBack: () => void;
  onAdminPress: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  shards,
  playerLevel,
  onUpdateSettings,
  onResetAllData,
  onBack,
  onAdminPress,
}) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);

  const updateSetting = <K extends keyof GameSettings>(
    key: K,
    val: GameSettings[K]
  ) => {
    const updated = { ...localSettings, [key]: val };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    audio.setVolumes(updated.masterVolume, updated.musicVolume, updated.sfxVolume);
  };

  const handleConfirmReset = () => {
    Alert.alert(
      'Reset All Game Progress',
      'Are you sure you want to erase all level progress, upgrades, and virtual shards? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            onResetAllData();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Navbar
        title="SETTINGS"
        subtitle="AUDIO & CONTROLS"
        onBack={onBack}
        shards={shards}
        playerLevel={playerLevel}
        onAdminPress={onAdminPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Audio Volume Controls */}
        <Text style={styles.sectionHeader}>AUDIO PREFERENCES</Text>
        <View style={styles.sectionCard}>
          {/* Master Volume */}
          <View style={styles.controlRow}>
            <View style={styles.labelCol}>
              <Text style={styles.controlTitle}>Master Volume</Text>
              <Text style={styles.controlSub}>Overall sound output</Text>
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  audio.playButton();
                  updateSetting(
                    'masterVolume',
                    Math.max(0, +(localSettings.masterVolume - 0.2).toFixed(1))
                  );
                }}
              >
                <Ionicons name="remove" size={16} color={THEME.colors.white} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>
                {Math.round(localSettings.masterVolume * 100)}%
              </Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  audio.playButton();
                  updateSetting(
                    'masterVolume',
                    Math.min(1, +(localSettings.masterVolume + 0.2).toFixed(1))
                  );
                }}
              >
                <Ionicons name="add" size={16} color={THEME.colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Music Volume */}
          <View style={styles.controlRow}>
            <View style={styles.labelCol}>
              <Text style={styles.controlTitle}>Music Volume</Text>
              <Text style={styles.controlSub}>Atmospheric synth soundtrack</Text>
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  audio.playButton();
                  updateSetting(
                    'musicVolume',
                    Math.max(0, +(localSettings.musicVolume - 0.2).toFixed(1))
                  );
                }}
              >
                <Ionicons name="remove" size={16} color={THEME.colors.white} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>
                {Math.round(localSettings.musicVolume * 100)}%
              </Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  audio.playButton();
                  updateSetting(
                    'musicVolume',
                    Math.min(1, +(localSettings.musicVolume + 0.2).toFixed(1))
                  );
                }}
              >
                <Ionicons name="add" size={16} color={THEME.colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* SFX Volume */}
          <View style={[styles.controlRow, { borderBottomWidth: 0 }]}>
            <View style={styles.labelCol}>
              <Text style={styles.controlTitle}>Sound Effects (SFX)</Text>
              <Text style={styles.controlSub}>Katana slashes, dashes, impacts</Text>
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  audio.playButton();
                  updateSetting(
                    'sfxVolume',
                    Math.max(0, +(localSettings.sfxVolume - 0.2).toFixed(1))
                  );
                }}
              >
                <Ionicons name="remove" size={16} color={THEME.colors.white} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>
                {Math.round(localSettings.sfxVolume * 100)}%
              </Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  audio.playButton();
                  updateSetting(
                    'sfxVolume',
                    Math.min(1, +(localSettings.sfxVolume + 0.2).toFixed(1))
                  );
                }}
              >
                <Ionicons name="add" size={16} color={THEME.colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Touch Controls Tuning */}
        <Text style={styles.sectionHeader}>ON-SCREEN TOUCH CONTROLS</Text>
        <View style={styles.sectionCard}>
          {/* Button Size */}
          <View style={styles.controlRow}>
            <View style={styles.labelCol}>
              <Text style={styles.controlTitle}>Button Size</Text>
              <Text style={styles.controlSub}>D-Pad & Action Hitboxes</Text>
            </View>
            <View style={styles.togglePillGroup}>
              {(['small', 'medium', 'large'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.pillOption,
                    localSettings.controlSize === size && styles.pillOptionActive,
                  ]}
                  onPress={() => {
                    audio.playButton();
                    updateSetting('controlSize', size);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillOptionText,
                      localSettings.controlSize === size && styles.pillOptionTextActive,
                    ]}
                  >
                    {size.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Button Opacity */}
          <View style={[styles.controlRow, { borderBottomWidth: 0 }]}>
            <View style={styles.labelCol}>
              <Text style={styles.controlTitle}>Control Opacity</Text>
              <Text style={styles.controlSub}>HUD overlay transparency</Text>
            </View>
            <View style={styles.togglePillGroup}>
              {([0.5, 0.75, 1.0] as const).map((op) => (
                <TouchableOpacity
                  key={op}
                  style={[
                    styles.pillOption,
                    localSettings.controlOpacity === op && styles.pillOptionActive,
                  ]}
                  onPress={() => {
                    audio.playButton();
                    updateSetting('controlOpacity', op);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillOptionText,
                      localSettings.controlOpacity === op && styles.pillOptionTextActive,
                    ]}
                  >
                    {Math.round(op * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Accessibility & Visual Effects */}
        <Text style={styles.sectionHeader}>ACCESSIBILITY & GRAPHICS</Text>
        <View style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={styles.labelCol}>
              <Text style={styles.controlTitle}>Screen Shake Effects</Text>
              <Text style={styles.controlSub}>Camera tremors on heavy boss strikes</Text>
            </View>
            <Switch
              value={localSettings.screenShake}
              onValueChange={(val) => updateSetting('screenShake', val)}
              trackColor={{ false: '#343a40', true: THEME.colors.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.labelCol}>
              <Text style={styles.controlTitle}>Reduced Motion Mode</Text>
              <Text style={styles.controlSub}>Minimizes background parallax sway</Text>
            </View>
            <Switch
              value={localSettings.reducedMotion}
              onValueChange={(val) => updateSetting('reducedMotion', val)}
              trackColor={{ false: '#343a40', true: THEME.colors.primary }}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={styles.labelCol}>
              <Text style={styles.controlTitle}>Damage Numbers / Floating Text</Text>
              <Text style={styles.controlSub}>Visual indicators on combat impact</Text>
            </View>
            <Switch
              value={localSettings.damageNumbers}
              onValueChange={(val) => updateSetting('damageNumbers', val)}
              trackColor={{ false: '#343a40', true: THEME.colors.primary }}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionHeader, { color: THEME.colors.crimson }]}>
          DANGER ZONE
        </Text>
        <View style={[styles.sectionCard, styles.dangerCard]}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleConfirmReset}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={16} color={THEME.colors.crimson} />
            <Text style={styles.resetBtnText}>RESET ALL PROGRESS & DATA</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimerText}>
          SHADOW RUSH • Version 1.0.0 • Mobile-First 2D Engine
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
  sectionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  labelCol: {
    flex: 1,
    paddingRight: 10,
  },
  controlTitle: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  controlSub: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  stepperValue: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '800',
    width: 44,
    textAlign: 'center',
  },
  togglePillGroup: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  pillOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pillOptionActive: {
    backgroundColor: THEME.colors.primary,
  },
  pillOptionText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  pillOptionTextActive: {
    color: '#05070a',
  },
  dangerCard: {
    borderColor: 'rgba(230, 57, 70, 0.4)',
    backgroundColor: 'rgba(230, 57, 70, 0.06)',
    paddingVertical: 14,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  resetBtnText: {
    color: THEME.colors.crimson,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disclaimerText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },
});
