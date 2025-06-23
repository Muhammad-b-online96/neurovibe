import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { X, TrendingUp, Battery, Zap } from 'lucide-react-native';
import { AITaskPrioritization, MoodType } from '@/types';
import { useMoodTheme } from '@/hooks/useMoodTheme';

interface AIPrioritizationModalProps {
  visible: boolean;
  onClose: () => void;
  prioritization: AITaskPrioritization | null;
  mood: MoodType | null;
}

export function AIPrioritizationModal({ visible, onClose, prioritization, mood }: AIPrioritizationModalProps) {
  const theme = useMoodTheme(mood);

  if (!prioritization) return null;

  const getMoodFitIcon = (moodFit: string) => {
    switch (moodFit) {
      case 'high':
        return <Zap size={16} color="#10b981" strokeWidth={2} />;
      case 'medium':
        return <Battery size={16} color="#f59e0b" strokeWidth={2} />;
      case 'low':
        return <TrendingUp size={16} color="#ef4444" strokeWidth={2} />;
      default:
        return <Battery size={16} color={theme.textSecondary} strokeWidth={2} />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return '#10b981'; // Green for high priority
    if (priority <= 4) return '#f59e0b'; // Yellow for medium priority
    return '#6b7280'; // Gray for low priority
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            AI Task Prioritization
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Prioritized Tasks */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recommended Priority Order
            </Text>
            {prioritization.prioritizedTasks.map((task, index) => (
              <View 
                key={index} 
                style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.priorityBadge}>
                    <View 
                      style={[
                        styles.priorityNumber, 
                        { backgroundColor: getPriorityColor(task.priority) }
                      ]}
                    >
                      <Text style={styles.priorityText}>
                        {task.priority}
                      </Text>
                    </View>
                    <Text style={[styles.taskTitle, { color: theme.text }]}>
                      {task.title}
                    </Text>
                  </View>
                  <View style={styles.moodFitContainer}>
                    {getMoodFitIcon(task.moodFit)}
                    <Text style={[styles.moodFitText, { color: theme.textSecondary }]}>
                      {task.moodFit} fit
                    </Text>
                  </View>
                </View>
                <Text style={[styles.reasoning, { color: theme.textSecondary }]}>
                  {task.reasoning}
                </Text>
              </View>
            ))}
          </View>

          {/* General Advice */}
          {prioritization.generalAdvice && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Strategy for Your Current Mood
              </Text>
              <View style={[styles.adviceCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                <Text style={[styles.adviceText, { color: theme.text }]}>
                  {prioritization.generalAdvice}
                </Text>
              </View>
            </View>
          )}

          {/* Energy Management */}
          {prioritization.energyManagement && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Energy Management Tips
              </Text>
              <View style={[styles.energyCard, { backgroundColor: theme.accent }]}>
                <Battery size={20} color={theme.primary} strokeWidth={2} />
                <Text style={[styles.energyText, { color: theme.text }]}>
                  {prioritization.energyManagement}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  priorityNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  moodFitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moodFitText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  reasoning: {
    fontSize: 14,
    lineHeight: 20,
  },
  adviceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  energyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  energyText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});