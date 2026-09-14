import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../../constants/theme';
import { TouchControlsConfig } from '../../types/game';

interface VirtualControlsProps {
  config: TouchControlsConfig;
  onMoveLeftStart: () => void;
  onMoveLeftEnd: () => void;
  onMoveRightStart: () => void;
  onMoveRightEnd: () => void;
  onCrouchToggle: (crouch: boolean) => void;
  onJumpPress: () => void;
  onJumpRelease: () => void;
  onAttack: () => void;
  onDash: () => void;
  onSpecial: () => void;
  dashReady: boolean;
  specialReady: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  config,
  onMoveLeftStart,
  onMoveLeftEnd,
  onMoveRightStart,
  onMoveRightEnd,
  onCrouchToggle,
  onJumpPress,
  onJumpRelease,
  onAttack,
  onDash,
  onSpecial,
  dashReady,
  specialReady,
}) => {
  // Sizing scale based on config
  const sizeMultiplier =
    config.size === 'small' ? 0.85 : config.size === 'large' ? 1.15 : 1.0;
  const dpadBtnSize = 58 * sizeMultiplier;
  const actionBtnSize = 56 * sizeMultiplier;

  return (
    <View
      style={[styles.container, { opacity: config.opacity }]}
      pointerEvents="box-none"
    >
      {/* Left Side: Movement D-Pad */}
      <View style={styles.leftControlCluster}>
        <View style={styles.dpadRow}>
          {/* Move Left */}
          <TouchableOpacity
            style={[
              styles.dpadButton,
              { width: dpadBtnSize, height: dpadBtnSize },
            ]}
            onPressIn={onMoveLeftStart}
            onPressOut={onMoveLeftEnd}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={26 * sizeMultiplier} color={THEME.colors.white} />
          </TouchableOpacity>

          {/* Crouch */}
          <TouchableOpacity
            style={[
              styles.dpadButton,
              styles.crouchButton,
              { width: dpadBtnSize * 0.9, height: dpadBtnSize * 0.9 },
            ]}
            onPressIn={() => onCrouchToggle(true)}
            onPressOut={() => onCrouchToggle(false)}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-down" size={20 * sizeMultiplier} color={THEME.colors.textSecondary} />
          </TouchableOpacity>

          {/* Move Right */}
          <TouchableOpacity
            style={[
              styles.dpadButton,
              { width: dpadBtnSize, height: dpadBtnSize },
            ]}
            onPressIn={onMoveRightStart}
            onPressOut={onMoveRightEnd}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-forward" size={26 * sizeMultiplier} color={THEME.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Right Side: Action Buttons (Jump, Attack, Dash, Special) */}
      <View style={styles.rightControlCluster}>
        {/* Top Row: Special & Dash */}
        <View style={styles.actionTopRow}>
          {/* Special Ability */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.specialButton,
              {
                width: actionBtnSize * 0.9,
                height: actionBtnSize * 0.9,
                opacity: specialReady ? 1 : 0.45,
              },
            ]}
            onPress={onSpecial}
            activeOpacity={0.7}
          >
            <Ionicons name="disc" size={20 * sizeMultiplier} color={THEME.colors.white} />
            <Text style={styles.buttonLabel}>SP</Text>
          </TouchableOpacity>

          {/* Dash */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.dashButton,
              {
                width: actionBtnSize * 0.9,
                height: actionBtnSize * 0.9,
                opacity: dashReady ? 1 : 0.45,
              },
            ]}
            onPress={onDash}
            activeOpacity={0.7}
          >
            <Ionicons name="flash" size={20 * sizeMultiplier} color={THEME.colors.white} />
            <Text style={styles.buttonLabel}>DASH</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Row: Attack & Jump */}
        <View style={styles.actionBottomRow}>
          {/* Attack Katana */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.attackButton,
              { width: actionBtnSize * 1.1, height: actionBtnSize * 1.1 },
            ]}
            onPress={onAttack}
            activeOpacity={0.6}
          >
            <Ionicons name="cut" size={26 * sizeMultiplier} color={THEME.colors.white} />
            <Text style={styles.buttonLabel}>SLASH</Text>
          </TouchableOpacity>

          {/* Jump */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.jumpButton,
              { width: actionBtnSize * 1.15, height: actionBtnSize * 1.15 },
            ]}
            onPressIn={onJumpPress}
            onPressOut={onJumpRelease}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-up" size={28 * sizeMultiplier} color={THEME.colors.white} />
            <Text style={styles.buttonLabel}>JUMP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 100,
  },
  leftControlCluster: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dpadButton: {
    backgroundColor: 'rgba(20, 24, 33, 0.75)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(72, 202, 228, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  crouchButton: {
    backgroundColor: 'rgba(16, 19, 26, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  rightControlCluster: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  actionTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginRight: 6,
  },
  actionBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  actionButton: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: -2,
    letterSpacing: 0.5,
  },
  jumpButton: {
    backgroundColor: 'rgba(72, 202, 228, 0.85)',
    borderWidth: 2,
    borderColor: '#90e0ef',
  },
  attackButton: {
    backgroundColor: 'rgba(230, 57, 70, 0.85)',
    borderWidth: 2,
    borderColor: '#ff4d6d',
  },
  dashButton: {
    backgroundColor: 'rgba(252, 163, 17, 0.8)',
    borderWidth: 1.5,
    borderColor: '#ffd166',
  },
  specialButton: {
    backgroundColor: 'rgba(114, 9, 183, 0.85)',
    borderWidth: 1.5,
    borderColor: '#b5179e',
  },
});
