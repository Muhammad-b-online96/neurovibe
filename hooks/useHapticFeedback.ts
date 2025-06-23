import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useHapticFeedback() {
  const triggerImpact = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (Platform.OS !== 'web') {
      switch (style) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    }
  };

  const triggerNotification = (type: 'success' | 'warning' | 'error' = 'success') => {
    if (Platform.OS !== 'web') {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    }
  };

  const triggerSelection = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  return {
    triggerImpact,
    triggerNotification,
    triggerSelection,
  };
}