import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 24, color = '#0ea5e9' }: LoadingSpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View className="items-center justify-center">
      <Animated.View
        style={[animatedStyle]}
        className="border-2 border-t-transparent rounded-full"
        style={{
          width: size,
          height: size,
          borderColor: color,
          borderTopColor: 'transparent',
        }}
      />
    </View>
  );
}