import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Filter, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useMoodStore } from '@/store/moodStore';
import { useTaskStore } from '@/store/taskStore';
import { useAIStore } from '@/store/aiStore';
import { useMoodTheme } from '@/hooks/useMoodTheme';
import { TaskCard } from '@/components/ui/TaskCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AIAssistButton } from '@/components/ui/AIAssistButton';
import { AIBreakdownModal } from '@/components/ui/AIBreakdownModal';
import { AIPrioritizationModal } from '@/components/ui/AIPrioritizationModal';
import { FocusTask, AITaskBreakdown, AITaskPrioritization } from '@/types';

export default function TasksScreen() {
  const { user, profile } = useAuthStore();
  const { currentMood } = useMoodStore();
  const { tasks, loading, fetchTasks, createTask, deleteTask, toggleTaskStatus } = useTaskStore();
  const { getTaskBreakdown, getTaskPrioritization, loading: aiLoading } = useAIStore();
  const theme = useMoodTheme(currentMood);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  // AI states
  const [selectedTask, setSelectedTask] = useState<FocusTask | null>(null);
  const [aiBreakdown, setAiBreakdown] = useState<AITaskBreakdown | null>(null);
  const [aiPrioritization, setAiPrioritization] = useState<AITaskPrioritization | null>(null);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showPrioritizationModal, setShowPrioritizationModal] = useState(false);
  const [taskAiLoading, setTaskAiLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks(user.id);
    }
  }, [user]);

  const handleCreateTask = async () => {
    if (!user || !newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      await createTask({
        user_id: user.id,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        status: 'pending',
      });

      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowCreateModal(false);
      Alert.alert('Success', 'Task created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTask(taskId)
        }
      ]
    );
  };

  const handleTaskAIAssist = async (task: FocusTask) => {
    if (!user || !currentMood) {
      Alert.alert('Error', 'Please set your mood first to use AI assistance');
      return;
    }

    if (!profile?.dev_mode_enabled) {
      Alert.alert('AI Features', 'AI features require a subscription or dev mode. Enable dev mode in Settings to try it out.');
      return;
    }

    setTaskAiLoading(task.id);
    setSelectedTask(task);

    try {
      const breakdown = await getTaskBreakdown(task, currentMood, user.id);
      setAiBreakdown(breakdown);
      setShowBreakdownModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI assistance. Please try again.');
    } finally {
      setTaskAiLoading(null);
    }
  };

  const handleTaskPrioritization = async () => {
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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const pendingCount = tasks.filter(task => task.status === 'pending').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Your Tasks
          </Text>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.stats, { color: theme.textSecondary }]}>
              {pendingCount} pending • {completedCount} completed
            </Text>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setFilter(filter === 'all' ? 'pending' : 'all')}
                style={[styles.filterButton, { backgroundColor: theme.accent }]}
              >
                <Filter size={20} color={theme.primary} strokeWidth={2} />
              </TouchableOpacity>
              
              {pendingCount > 0 && (
                <AIAssistButton
                  onPress={handleTaskPrioritization}
                  mood={currentMood}
                  loading={aiLoading}
                  size="medium"
                />
              )}
              
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                style={[styles.createButton, { backgroundColor: theme.primary }]}
              >
                <Plus size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.createButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size={32} color={theme.primary} />
          </View>
        ) : (
          <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
            {filteredTasks.length === 0 ? (
              <Animated.View 
                entering={FadeInDown.delay(200)}
                style={styles.emptyState}
              >
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No tasks found
                </Text>
                <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                  {filter === 'all' 
                    ? "Create your first task to get started!"
                    : `No ${filter} tasks at the moment.`
                  }
                </Text>
              </Animated.View>
            ) : (
              filteredTasks.map((task, index) => (
                <Animated.View
                  key={task.id}
                  entering={FadeInDown.delay(index * 100)}
                >
                  <TaskCard
                    task={task}
                    mood={currentMood}
                    onToggleComplete={toggleTaskStatus}
                    onDelete={handleDeleteTask}
                    onAIAssist={handleTaskAIAssist}
                    aiLoading={taskAiLoading === task.id}
                  />
                </Animated.View>
              ))
            )}
          </ScrollView>
        )}

        {/* Create Task Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Create New Task
                </Text>
                
                <TouchableOpacity
                  onPress={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                >
                  <Text style={[styles.cancelText, { color: theme.primary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>
                  Task Title *
                </Text>
                <TextInput
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  placeholder="Enter task title..."
                  style={[
                    styles.textInput,
                    { 
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                      color: theme.text
                    }
                  ]}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>
                  Description (Optional)
                </Text>
                <TextInput
                  value={newTaskDescription}
                  onChangeText={setNewTaskDescription}
                  placeholder="Add more details..."
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.textInput,
                    styles.textArea,
                    { 
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                      color: theme.text
                    }
                  ]}
                />
              </View>

              <TouchableOpacity
                onPress={handleCreateTask}
                style={[styles.submitButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.submitButtonText}>
                  Create Task
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* AI Modals */}
        <AIBreakdownModal
          visible={showBreakdownModal}
          onClose={() => setShowBreakdownModal(false)}
          breakdown={aiBreakdown}
          mood={currentMood}
          taskTitle={selectedTask?.title || ''}
        />

        <AIPrioritizationModal
          visible={showPrioritizationModal}
          onClose={() => setShowPrioritizationModal(false)}
          prioritization={aiPrioritization}
          mood={currentMood}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerInfo: {
    marginBottom: 16,
  },
  stats: {
    fontSize: 16,
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});