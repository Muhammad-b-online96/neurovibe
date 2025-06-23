import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Switch, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, Bell, Shield, HelpCircle, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useMoodStore } from '@/store/moodStore';
import { useMoodTheme } from '@/hooks/useMoodTheme';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SettingsScreen() {
  const { user, profile, signOut, updateProfile } = useAuthStore();
  const { currentMood } = useMoodStore();
  const theme = useMoodTheme(currentMood);
  const [loading, setLoading] = useState(false);
  const [devModeLoading, setDevModeLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDevModeToggle = async (enabled: boolean) => {
    if (!user) return;
    
    setDevModeLoading(true);
    try {
      await updateProfile({ dev_mode_enabled: enabled });
      Alert.alert(
        'Dev Mode Updated', 
        enabled 
          ? 'Dev mode enabled! You can now use AI features for free.' 
          : 'Dev mode disabled. AI features will require a subscription.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update dev mode setting.');
    } finally {
      setDevModeLoading(false);
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available in a future update.'),
        },
      ]
    },
    {
      title: 'AI Features',
      items: [
        {
          icon: Sparkles,
          label: 'Dev Mode',
          subtitle: 'Enable AI features for testing',
          isToggle: true,
          value: profile?.dev_mode_enabled || false,
          onToggle: handleDevModeToggle,
          loading: devModeLoading,
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon.'),
        },
        {
          icon: Shield,
          label: 'Privacy',
          onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon.'),
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & FAQ',
          onPress: () => Alert.alert('Coming Soon', 'Help section will be available soon.'),
        },
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Settings
          </Text>
        </Animated.View>

        {/* User Profile Card */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          style={[styles.profileCard, { backgroundColor: theme.surface }]}
        >
          <View style={styles.profileContent}>
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <User size={32} color={theme.primary} strokeWidth={2} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.displayName, { color: theme.text }]}>
                {profile?.display_name || 'User'}
              </Text>
              <Text style={[styles.email, { color: theme.textSecondary }]}>
                {user?.email}
              </Text>
              {profile?.neurodivergent_status && (
                <Text style={[styles.status, { color: theme.textSecondary }]}>
                  {profile.neurodivergent_status}
                </Text>
              )}
              {profile?.dev_mode_enabled && (
                <View style={[styles.devBadge, { backgroundColor: theme.primary }]}>
                  <Sparkles size={12} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.devBadgeText}>Dev Mode</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay((sectionIndex + 2) * 100)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {section.title}
            </Text>
            
            <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
              {section.items.map((item, itemIndex) => (
                <View key={item.label}>
                  <TouchableOpacity
                    onPress={item.isToggle ? undefined : item.onPress}
                    style={[
                      styles.settingItem,
                      itemIndex < section.items.length - 1 && { 
                        borderBottomWidth: 1, 
                        borderBottomColor: theme.border 
                      }
                    ]}
                    disabled={item.isToggle}
                  >
                    <View style={styles.settingItemLeft}>
                      <item.icon 
                        size={24} 
                        color={theme.primary} 
                        strokeWidth={2} 
                      />
                      <View style={styles.settingItemText}>
                        <Text style={[styles.settingLabel, { color: theme.text }]}>
                          {item.label}
                        </Text>
                        {item.subtitle && (
                          <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    {item.isToggle ? (
                      <View style={styles.toggleContainer}>
                        {item.loading && (
                          <LoadingSpinner size={16} color={theme.primary} />
                        )}
                        <Switch
                          value={item.value}
                          onValueChange={item.onToggle}
                          disabled={item.loading}
                          trackColor={{ false: theme.border, true: theme.primary }}
                          thumbColor="#ffffff"
                        />
                      </View>
                    ) : (
                      <Text style={{ color: theme.textSecondary }}>›</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Sign Out Button */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={loading}
            style={styles.signOutButton}
          >
            {loading ? (
              <LoadingSpinner size={20} color="#dc2626" />
            ) : (
              <>
                <LogOut size={20} color="#dc2626" strokeWidth={2} />
                <Text style={styles.signOutText}>
                  Sign Out
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    marginBottom: 8,
  },
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  devBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    gap: 8,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});