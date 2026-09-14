import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../../constants/theme';
import { audio } from '../../services/audioService';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'crimson' | 'gold' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  icon,
  size = 'medium',
  onPress,
  disabled,
  style,
  ...rest
}) => {
  const handlePress = (e: any) => {
    if (!disabled) {
      audio.playButton();
      if (onPress) onPress(e);
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'crimson':
        return styles.crimson;
      case 'gold':
        return styles.gold;
      case 'outline':
        return styles.outline;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const getTextVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'crimson':
        return styles.crimsonText;
      case 'gold':
        return styles.goldText;
      case 'outline':
        return styles.outlineText;
      case 'secondary':
      default:
        return styles.secondaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.sizeSmall;
      case 'large':
        return styles.sizeLarge;
      case 'medium':
      default:
        return styles.sizeMedium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      {...rest}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'small' ? 14 : size === 'large' ? 20 : 16}
          color={
            variant === 'primary'
              ? '#05070a'
              : variant === 'gold'
              ? '#05070a'
              : THEME.colors.white
          }
          style={styles.icon}
        />
      )}
      <Text style={[styles.baseText, getTextVariantStyle()]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
  },
  baseText: {
    fontWeight: '800',
    letterSpacing: 1,
  },
  icon: {
    marginRight: 6,
  },
  sizeSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  sizeMedium: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  sizeLarge: {
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  primary: {
    backgroundColor: THEME.colors.primary,
    borderColor: '#90e0ef',
  },
  primaryText: {
    color: '#05070a',
    fontSize: 14,
  },
  secondary: {
    backgroundColor: THEME.colors.surfaceLight,
    borderColor: THEME.colors.surfaceBorder,
  },
  secondaryText: {
    color: THEME.colors.white,
    fontSize: 13,
  },
  crimson: {
    backgroundColor: THEME.colors.crimson,
    borderColor: '#ff4d6d',
  },
  crimsonText: {
    color: THEME.colors.white,
    fontSize: 14,
  },
  gold: {
    backgroundColor: THEME.colors.gold,
    borderColor: '#ffd166',
  },
  goldText: {
    color: '#05070a',
    fontSize: 14,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: THEME.colors.primary,
  },
  outlineText: {
    color: THEME.colors.primary,
    fontSize: 13,
  },
  disabled: {
    opacity: 0.45,
  },
});
