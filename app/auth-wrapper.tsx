import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import LoginScreen from './login';

export default function AuthWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to authenticated
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount and listen for changes
  useEffect(() => {
    const checkAuth = () => {
      // Default to authenticated (home page is default)
      // Only show login if explicitly logged out
      const isLoggedOut = localStorage.getItem('app_logged_out') === 'true';
      setIsAuthenticated(!isLoggedOut);
      setIsLoading(false);
      console.log('Auth check - logged out:', isLoggedOut);
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
