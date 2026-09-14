import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../../constants/theme';
import { audio } from '../../services/audioService';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onRestartLevel: () => void;
  onSettings: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  visible,
  onResume,
  onRestartCheckpoint,
  onRestartLevel,
  onSettings,
  onExit,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>GAME PAUSED</Text>
          <Text style={styles.subtitle}>SHADOW RUSH • MOONLIT VEIL</Text>

          <View style={styles.btnList}>
            <TouchableOpacity
              style={[styles.btn, styles.btnResume]}
              onPress={() => {
                audio.playButton();
                onResume();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={18} color={THEME.colors.white} />
              <Text style={styles.btnResumeText}>RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                audio.playButton();
                onRestartCheckpoint();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="flag" size={18} color={THEME.colors.primary} />
              <Text style={styles.btnText}>RESTART AT CHECKPOINT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                audio.playButton();
                onRestartLevel();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.btnText}>RESTART LEVEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                audio.playButton();
                onSettings();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-sharp" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.btnText}>SETTINGS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnExit]}
              onPress={() => {
                audio.playButton();
                onExit();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out" size={18} color={THEME.colors.crimson} />
              <Text style={styles.btnExitText}>RETURN TO MENU</Text>
            </TouchableOpacity>
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
    width: '90%',
    maxWidth: 380,
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: THEME.colors.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: 20,
  },
  btnList: {
    width: '100%',
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  btnResume: {
    backgroundColor: THEME.colors.primary,
    borderColor: '#90e0ef',
  },
  btnResumeText: {
    color: '#05070a',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  btnExit: {
    backgroundColor: 'rgba(230, 57, 70, 0.12)',
    borderColor: 'rgba(230, 57, 70, 0.3)',
  },
  btnExitText: {
    color: THEME.colors.crimson,
    fontSize: 13,
    fontWeight: '700',
  },
});
