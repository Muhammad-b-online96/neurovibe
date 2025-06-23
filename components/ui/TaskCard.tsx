import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Check, Trash2, Clock } from 'lucide-react-native';
import { FocusTask, MoodType } from '@/types';
import { useMoodTheme } from '@/hooks/useMoodTheme';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { AIAssistButton } from './AIAssistButton';

interface TaskCardProps {
  task: FocusTask;
  mood: MoodType | null;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (task: FocusTask) => void;
  onAIAssist?: (task: FocusTask) => void;
  aiLoading?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function TaskCard({ 
  task, 
  mood, 
  onToggleComplete, 
  onDelete, 
  onPress, 
  onAIAssist,
  aiLoading = false 
}: TaskCardProps) {
  const theme = useMoodTheme(mood);
  const { triggerImpact, triggerNotification } = useHapticFeedback();
  
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleComplete = () => {
    triggerNotification('success');
    onToggleComplete(task.id);
  };

  const handleDelete = () => {
    triggerNotification('error');
    onDelete(task.id);
  };

  const handleAIAssist = () => {
    if (onAIAssist) {
      triggerImpact('light');
      onAIAssist(task);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const threshold = 100;
      
      if (event.translationX > threshold) {
        // Swipe right - complete task
        translateX.value = withSpring(0);
        runOnJS(handleComplete)();
      } else if (event.translationX < -threshold) {
        // Swipe left - delete task
        translateX.value = withSpring(0);
        runOnJS(handleDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      triggerImpact('light');
      scale.value = withSpring(0.98);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      if (onPress) {
        runOnJS(onPress)(task);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
    };
  });

  const isCompleted = task.status === 'completed';
  const StatusIcon = task.status === 'completed' ? Check : Clock;

  return (
    <GestureDetector gesture={Gesture.Simultaneous(panGesture, tapGesture)}>
      <AnimatedView
        style={[
          animatedStyle,
          styles.container,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            opacity: isCompleted ? 0.7 : 1,
          }
        ]}
      >
        <View style={styles.content}>
          <View style={styles.taskInfo}>
            <Text 
              style={[
                styles.title,
                { 
                  color: theme.text,
                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                }
              ]}
            >
              {task.title}
            </Text>
            {task.description && (
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {task.description}
              </Text>
            )}
          </View>
          
          <View style={styles.actions}>
            {onAIAssist && !isCompleted && (
              <AIAssistButton
                onPress={handleAIAssist}
                mood={mood}
                loading={aiLoading}
                size="small"
              />
            )}
            
            <TouchableOpacity
              onPress={handleComplete}
              style={[styles.actionButton, { backgroundColor: theme.accent }]}
            >
              <StatusIcon 
                size={16} 
                color={theme.primary}
                strokeWidth={2}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <Trash2 
                size={16} 
                color="#dc2626"
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {new Date(task.created_at).toLocaleDateString()}
          </Text>
          
          <Text style={[styles.swipeHint, { color: theme.textSecondary }]}>
            Swipe to interact
          </Text>
        </View>
      </AnimatedView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  date: {
    fontSize: 12,
  },
  swipeHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});