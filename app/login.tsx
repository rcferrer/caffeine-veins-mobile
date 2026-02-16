import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'customer'>('customer');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting login with:', username);
        const result = await login(username, password);
        console.log('Login result:', result);
        if (result.success) {
          router.replace('/');
        } else {
          Alert.alert('Login Failed', result.error || 'Invalid credentials');
        }
      } else {
        console.log('Attempting signup with:', username, role);
        const result = await signup(username, password, role);
        console.log('Signup result:', result);
        if (result.success) {
          router.replace('/');
        } else {
          Alert.alert('Sign Up Failed', result.error || 'Could not create account');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Caffeine Veins</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#999"
            secureTextEntry
          />

          {!isLogin && (
            <>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
                  onPress={() => setRole('customer')}
                >
                  <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>
                    Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
                  onPress={() => setRole('admin')}
                >
                  <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.toggleLink}>{isLogin ? 'Sign Up' : 'Login'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6F4E37',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  roleButtonActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
  },
  roleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6F4E37',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  toggleLink: {
    color: '#6F4E37',
    fontWeight: '600',
  },
});
