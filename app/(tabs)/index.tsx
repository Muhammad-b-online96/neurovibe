import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  FadeIn,
  FadeInDown
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useMoodStore } from '@/store/moodStore';
import { useTaskStore } from '@/store/taskStore';
import { useAIStore } from '@/store/aiStore';
import { useMoodTheme } from '@/hooks/useMoodTheme';
import { MoodButton } from '@/components/ui/MoodButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AIAssistButton } from '@/components/ui/AIAssistButton';
import { AIPrioritizationModal } from '@/components/ui/AIPrioritizationModal';
import { getRandomQuoteForMood } from '@/data/moodQuotes';
import { MoodType, AITaskPrioritization } from '@/types';

export default function HomeScreen() {
  const { user, profile } = useAuthStore();
  const { currentMood, setMood, fetchMoodHistory, loading } = useMoodStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { getTaskPrioritization, loading: aiLoading } = useAIStore();
  const theme = useMoodTheme(currentMood);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [quote, setQuote] = useState<string>('');
  const [aiPrioritization, setAiPrioritization] = useState<AITaskPrioritization | null>(null);
  const [showPrioritizationModal, setShowPrioritizationModal] = useState(false);
  
  const confirmationScale = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    if (user) {
      fetchMoodHistory(user.id);
      fetchTasks(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (currentMood) {
      const randomQuote = getRandomQuoteForMood(currentMood);
      setQuote(randomQuote.text);
      
      // Animate background transition
      backgroundOpacity.value = withSequence(
        withSpring(0, { damping: 20, stiffness: 100 }),
        withSpring(1, { damping: 20, stiffness: 100 })
      );
    }
  }, [currentMood]);

  const handleMoodSelection = async (mood: MoodType) => {
    if (!user) return;
    
    setSelectedMood(mood);
    
    // Show confirmation animation
    confirmationScale.value = withSequence(
      withSpring(1.2, { damping: 15, stiffness: 300 }),
      withSpring(0, { damping: 15, stiffness: 300 })
    );

    try {
      await setMood(mood, user.id);
      Alert.alert('Mood Updated', `Your mood has been set to ${mood}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update mood. Please try again.');
      setSelectedMood(null);
    }
  };

  const handleAIPrioritization = async () => {
    if (!user || !currentMood) {
      Alert.alert('Error', 'Please set your mood first to use AI assistance');
      return;
    }

    if (!profile?.dev_mode_enabled) {
      Alert.alert('AI Features', 'AI features require a subscription or dev mode. Enable dev mode in Settings to try it out.');
      return;
    }

    const pendingTasks = tasks.filter(task => task.status === 'pending');
    if (pendingTasks.length === 0) {
      Alert.alert('No Tasks', 'You need pending tasks to get prioritization advice.');
      return;
    }

    try {
      const prioritization = await getTaskPrioritization(pendingTasks, currentMood, user.id);
      setAiPrioritization(prioritization);
      setShowPrioritizationModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI prioritization. Please try again.');
    }
  };

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
      backgroundColor: theme.background,
    };
  });

  const confirmationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: confirmationScale.value }],
    };
  });

  const moodButtons = [
    { mood: 'overwhelmed' as MoodType, emoji: '😫', label: 'Overwhelmed' },
    { mood: 'focused' as MoodType, emoji: '🎯', label: 'Focused' },
    { mood: 'lowenergy' as MoodType, emoji: '🔋', label: 'Low Energy' },
  ];

  const pendingTasksCount = tasks.filter(task => task.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, backgroundStyle]}>
        <ScrollView style={styles.scrollView}>
          <Animated.View entering={FadeInDown} style={styles.greeting}>
            <Text style={[styles.greetingText, { color: theme.text }]}>
              Hello, {profile?.display_name || 'there'}! 👋
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              How are you feeling right now?
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(200)} style={styles.moodButtons}>
            <View style={styles.moodButtonsRow}>
              {moodButtons.map((button, index) => (
                <MoodButton
                  key={button.mood}
                  mood={button.mood}
                  emoji={button.emoji}
                  label={button.label}
                  onPress={handleMoodSelection}
                  isSelected={currentMood === button.mood}
                />
              ))}
            </View>
          </Animated.View>

          {loading && (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size={32} color={theme.primary} />
            </View>
          )}

          {currentMood && quote && (
            <Animated.View 
              entering={FadeInDown.delay(400)}
              style={[styles.quoteCard, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.quoteText, { color: theme.text }]}>
                "{quote}"
              </Text>
              
              <View style={styles.moodBadgeContainer}>
                <View style={[styles.moodBadge, { backgroundColor: theme.accent }]}>
                  <Text style={[styles.moodBadgeText, { color: theme.primary }]}>
                    Current mood: {currentMood}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {currentMood && (
            <Animated.View 
              entering={FadeInDown.delay(600)}
              style={[styles.insightsCard, { backgroundColor: theme.surface }]}
            >
              <View style={styles.insightsHeader}>
                <Text style={[styles.insightsTitle, { color: theme.text }]}>
                  Mood Insights
                </Text>
                
                {pendingTasksCount > 0 && (
                  <AIAssistButton
                    onPress={handleAIPrioritization}
                    mood={currentMood}
                    loading={aiLoading}
                    size="small"
                  />
                )}
              </View>
              
              <Text style={[styles.insightsText, { color: theme.textSecondary }]}>
                {currentMood === 'overwhelmed' && 
                  "When overwhelmed, remember to take breaks and practice deep breathing. Consider breaking large tasks into smaller, manageable steps."
                }
                {currentMood === 'focused' && 
                  "Great energy for tackling challenging tasks! This is an excellent time to work on your most important goals and make significant progress."
                }
                {currentMood === 'lowenergy' && 
                  "It's okay to have low energy days. Focus on gentle, nurturing activities and don't pressure yourself to be highly productive."
                }
              </Text>

              {pendingTasksCount > 0 && (
                <View style={styles.taskSummary}>
                  <Text style={[styles.taskSummaryText, { color: theme.textSecondary }]}>
                    You have {pendingTasksCount} pending task{pendingTasksCount !== 1 ? 's' : ''}. 
                    Get AI-powered prioritization advice based on your current mood.
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Confirmation animation overlay */}
          <Animated.View
            style={[
              confirmationStyle,
              styles.confirmationOverlay
            ]}
          >
            <View style={styles.confirmationBadge}>
              <Text style={styles.confirmationText}>✓</Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* AI Prioritization Modal */}
        <AIPrioritizationModal
          visible={showPrioritizationModal}
          onClose={() => setShowPrioritizationModal(false)}
          prioritization={aiPrioritization}
          mood={currentMood}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  greeting: {
    marginBottom: 32,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  moodButtons: {
    marginBottom: 32,
  },
  moodButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  quoteCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  moodBadgeContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  moodBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  moodBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightsCard: {
    borderRadius: 16,
    padding: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  insightsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  taskSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  taskSummaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  confirmationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 1000,
  },
  confirmationBadge: {
    backgroundColor: '#10b981',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationText: {
    color: '#ffffff',
    fontSize: 24,
  },
});