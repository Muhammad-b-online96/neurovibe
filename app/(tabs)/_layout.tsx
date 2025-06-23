import { Tabs } from 'expo-router';
import { Heart, CheckSquare, Settings } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useMoodStore } from '@/store/moodStore';
import { useMoodTheme } from '@/hooks/useMoodTheme';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const { user, loading } = useAuthStore();
  const { currentMood } = useMoodStore();
  const theme = useMoodTheme(currentMood);

  if (loading) {
    return null; // Show loading state if needed
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mood',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ size, color }) => (
            <CheckSquare size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}