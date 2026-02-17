import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';

export default function PromoCodeScreen() {
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    console.log('Submit clicked, code:', promoCode);
    if (promoCode === '2323') {
      setError('');
      setIsLoading(true);
      console.log('Code correct, setting auth and navigating');
      
      // Set authentication flag
      localStorage.setItem('app_authenticated', 'true');
      localStorage.removeItem('app_logged_out');
      
      // Navigate to home
      setTimeout(() => {
        console.log('Navigating to home');
        router.replace('/(tabs)');
      }, 500);
    } else {
      console.log('Code incorrect');
      setError('Invalid promo code. Please try again.');
      setPromoCode('');
    }
  };

  console.log('PromoCodeScreen rendering');
  
  return (
    <ScreenContainer containerClassName="bg-gradient-to-b from-blue-500 to-purple-600">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>🏀</Text>
            <Text style={styles.title}>Promo Code</Text>
            <Text style={styles.subtitle}>Enter your code to unlock features</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Form Group */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Promo Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit code"
                maxLength={4}
                value={promoCode}
                onChangeText={setPromoCode}
                editable={!isLoading}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Processing...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 60,
    elevation: 5,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#667eea',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
