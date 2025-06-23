import { useMemo } from 'react';
import { MoodType, ThemeColors } from '@/types';

const moodThemes: Record<MoodType, ThemeColors> = {
  overwhelmed: {
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    background: '#f0f9ff',
    surface: '#ffffff',
    text: '#0c4a6e',
    textSecondary: '#075985',
    border: '#bae6fd',
    accent: '#7dd3fc',
  },
  focused: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    background: '#fffbeb',
    surface: '#ffffff',
    text: '#78350f',
    textSecondary: '#92400e',
    border: '#fde68a',
    accent: '#fcd34d',
  },
  lowenergy: {
    primary: '#d946ef',
    secondary: '#e879f9',
    background: '#fdf4ff',
    surface: '#ffffff',
    text: '#701a75',
    textSecondary: '#86198f',
    border: '#f5d0fe',
    accent: '#f0abfc',
  },
};

export function useMoodTheme(mood: MoodType | null) {
  return useMemo(() => {
    if (!mood) {
      return moodThemes.focused; // Default theme
    }
    return moodThemes[mood];
  }, [mood]);
}

export function getMoodAnimationConfig(mood: MoodType | null) {
  const configs = {
    overwhelmed: {
      duration: 800,
      easing: 'ease-out',
      spring: { damping: 20, stiffness: 100 },
    },
    focused: {
      duration: 300,
      easing: 'ease-in-out',
      spring: { damping: 15, stiffness: 200 },
    },
    lowenergy: {
      duration: 1200,
      easing: 'ease-in',
      spring: { damping: 25, stiffness: 80 },
    },
  };

  return mood ? configs[mood] : configs.focused;
}