import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useMoodTheme } from '@/hooks/useMoodTheme';
import { MoodType } from '@/types';

interface AIAssistButtonProps {
  onPress: () => void;
  mood: MoodType | null;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function AIAssistButton({ onPress, mood, loading = false, size = 'medium' }: AIAssistButtonProps) {
  const theme = useMoodTheme(mood);

  const sizeStyles = {
    small: { padding: 6, iconSize: 16, fontSize: 12 },
    medium: { padding: 8, iconSize: 18, fontSize: 14 },
    large: { padding: 12, iconSize: 20, fontSize: 16 },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[
        styles.button,
        {
          backgroundColor: theme.primary,
          padding: currentSize.padding,
          opacity: loading ? 0.6 : 1,
        }
      ]}
    >
      <View style={styles.content}>
        <Sparkles 
          size={currentSize.iconSize} 
          color="#ffffff" 
          strokeWidth={2} 
        />
        <Text style={[styles.text, { fontSize: currentSize.fontSize }]}>
          {loading ? 'AI...' : 'AI Assist'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
  },
});