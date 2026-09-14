import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

interface CardProps extends ViewProps {
  variant?: 'surface' | 'glow' | 'crimson';
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  style,
  children,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.base,
        variant === 'glow' && styles.glow,
        variant === 'crimson' && styles.crimson,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    borderColor: 'rgba(72, 202, 228, 0.4)',
    shadowColor: '#48cae4',
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  crimson: {
    borderColor: 'rgba(230, 57, 70, 0.4)',
    shadowColor: '#e63946',
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
});
