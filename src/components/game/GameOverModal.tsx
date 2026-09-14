import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../../constants/theme';
import { audio } from '../../services/audioService';

interface GameOverModalProps {
  visible: boolean;
  onRespawnCheckpoint: () => void;
  onRestartLevel: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  onRespawnCheckpoint,
  onRestartLevel,
  onExit,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons
            name="skull"
            size={48}
            color={THEME.colors.crimson}
            style={styles.skullIcon}
          />
          <Text style={styles.title}>CONSUMED BY SHADOW</Text>
          <Text style={styles.subtitle}>
            Your spirit wavers, but the sacred lantern flame beckons.
          </Text>

          <View style={styles.btnList}>
            <TouchableOpacity
              style={[styles.btn, styles.btnRespawn]}
              onPress={() => {
                audio.playButton();
                onRespawnCheckpoint();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="flag" size={18} color="#05070a" />
              <Text style={styles.btnRespawnText}>RESPAWN AT LANTERN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                audio.playButton();
                onRestartLevel();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color={THEME.colors.white} />
              <Text style={styles.btnText}>RESTART LEVEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnExit]}
              onPress={() => {
                audio.playButton();
                onExit();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.btnExitText}>GIVE UP & EXIT</Text>
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
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(230, 57, 70, 0.4)',
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  skullIcon: {
    marginBottom: 8,
  },
  title: {
    color: THEME.colors.crimson,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
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
  btnRespawn: {
    backgroundColor: THEME.colors.primary,
    borderColor: '#90e0ef',
  },
  btnRespawnText: {
    color: '#05070a',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnText: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  btnExit: {
    backgroundColor: 'transparent',
    borderColor: THEME.colors.border,
  },
  btnExitText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
