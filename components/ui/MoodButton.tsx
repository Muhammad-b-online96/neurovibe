import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { MoodType } from '@/types';
import { useMoodTheme } from '@/hooks/useMoodTheme';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface MoodButtonProps {
  mood: MoodType;
  emoji: string;
  label: string;
  onPress: (mood: MoodType) => void;
  isSelected?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function MoodButton({ mood, emoji, label, onPress, isSelected }: MoodButtonProps) {
  const theme = useMoodTheme(mood);
  const { triggerImpact } = useHapticFeedback();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const handlePress = () => {
    triggerImpact('medium');
    
    scale.value = withSequence(
      withSpring(0.95, { damping: 15, stiffness: 300 }),
      withSpring(1.05, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    
    pressed.value = withSequence(
      withSpring(1, { damping: 20, stiffness: 200 }),
      withSpring(0, { damping: 20, stiffness: 200 }, () => {
        runOnJS(onPress)(mood);
      })
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: 1 - pressed.value * 0.2,
    };
  });

  const buttonClass = isSelected 
    ? `border-2 shadow-lg` 
    : `border border-gray-200 shadow-sm`;

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      className={`rounded-3xl p-6 items-center justify-center min-h-[120px] flex-1 mx-2 ${buttonClass}`}
      style={[
        animatedStyle,
        {
          backgroundColor: isSelected ? theme.primary : theme.surface,
          borderColor: isSelected ? theme.primary : theme.border,
        }
      ]}
    >
      <Text className="text-4xl mb-2">{emoji}</Text>
      <Text 
        className="text-base font-medium text-center"
        style={{ 
          color: isSelected ? '#ffffff' : theme.text 
        }}
      >
        {label}
      </Text>
    </AnimatedTouchableOpacity>
  );
}