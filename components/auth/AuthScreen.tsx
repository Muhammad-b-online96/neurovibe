import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [neurodivergentStatus, setNeurodivergentStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuthStore();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && (!displayName || !neurodivergentStatus)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password, displayName, neurodivergentStatus);
        Alert.alert('Success', 'Account created successfully! Please check your email to verify your account.');
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-gradient-to-b from-blue-50 to-purple-50">
        <View className="flex-1 justify-center px-6 py-12">
          <View className="mb-8 items-center">
            <Text className="text-4xl font-bold text-gray-800 mb-2">NeuroVibe</Text>
            <Text className="text-lg text-gray-600 text-center">
              Your mood-adaptive companion for neurodivergent minds
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <Text className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
            />

            {isSignUp && (
              <>
                <TextInput
                  placeholder="Display Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
                />

                <TextInput
                  placeholder="Neurodivergent Status (e.g., ADHD, Autism, etc.)"
                  value={neurodivergentStatus}
                  onChangeText={setNeurodivergentStatus}
                  className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
                />
              </>
            )}

            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              className="bg-blue-500 rounded-xl py-4 items-center mb-4"
            >
              {loading ? (
                <LoadingSpinner size={20} color="#ffffff" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              className="items-center"
            >
              <Text className="text-blue-500 text-base">
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}