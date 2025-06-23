import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Clock, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react-native';
import { AITaskBreakdown, MoodType } from '@/types';
import { useMoodTheme } from '@/hooks/useMoodTheme';

interface AIBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  breakdown: AITaskBreakdown | null;
  mood: MoodType | null;
  taskTitle: string;
}

export function AIBreakdownModal({ visible, onClose, breakdown, mood, taskTitle }: AIBreakdownModalProps) {
  const theme = useMoodTheme(mood);

  if (!breakdown) return null;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={16} color="#ef4444" strokeWidth={2} />;
      case 'medium':
        return <Clock size={16} color="#f59e0b" strokeWidth={2} />;
      case 'low':
        return <CheckCircle2 size={16} color="#10b981" strokeWidth={2} />;
      default:
        return <Clock size={16} color={theme.textSecondary} strokeWidth={2} />;
    }
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
            AI Task Breakdown
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.taskHeader, { backgroundColor: theme.surface }]}>
            <Text style={[styles.taskTitle, { color: theme.text }]}>
              {taskTitle}
            </Text>
          </View>

          {/* Subtasks */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Suggested Subtasks
            </Text>
            {breakdown.subtasks.map((subtask, index) => (
              <View 
                key={index} 
                style={[styles.subtaskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.subtaskHeader}>
                  <View style={styles.priorityContainer}>
                    {getPriorityIcon(subtask.priority)}
                    <Text style={[styles.subtaskTitle, { color: theme.text }]}>
                      {subtask.title}
                    </Text>
                  </View>
                  <Text style={[styles.estimatedTime, { color: theme.textSecondary }]}>
                    {subtask.estimatedTime}
                  </Text>
                </View>
                <Text style={[styles.subtaskDescription, { color: theme.textSecondary }]}>
                  {subtask.description}
                </Text>
              </View>
            ))}
          </View>

          {/* Tips */}
          {breakdown.tips.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Helpful Tips
              </Text>
              {breakdown.tips.map((tip, index) => (
                <View 
                  key={index} 
                  style={[styles.tipCard, { backgroundColor: theme.accent }]}
                >
                  <Lightbulb size={16} color={theme.primary} strokeWidth={2} />
                  <Text style={[styles.tipText, { color: theme.text }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Mood-specific advice */}
          {breakdown.moodSpecificAdvice && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Mood-Specific Advice
              </Text>
              <View style={[styles.adviceCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                <Text style={[styles.adviceText, { color: theme.text }]}>
                  {breakdown.moodSpecificAdvice}
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
  taskHeader: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  subtaskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subtaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  estimatedTime: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  subtaskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
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
});