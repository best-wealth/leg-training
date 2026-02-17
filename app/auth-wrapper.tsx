import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import LoginScreen from './login';

export function AuthWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount and listen for changes
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('app_authenticated') === 'true';
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      console.log('Auth check:', authenticated);
    };
    
    checkAuth();
    
    // Listen for storage changes
    window.addEventListener('storage', checkAuth);
    
    // Also listen for direct localStorage changes within the same tab
    const interval = setInterval(checkAuth, 500);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('Rendering LoginScreen');
    return <LoginScreen />;
  }

  console.log('Rendering app Stack');
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="oauth/callback" />
    </Stack>
  );
}
