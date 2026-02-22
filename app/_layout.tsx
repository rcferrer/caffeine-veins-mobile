import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ProductProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootLayoutContent />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

function RootLayoutContent() {
  const { user, isLoading } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isLoading ? (
        <Stack.Screen name="login" />
      ) : user ? (
        user.role === 'admin' ? (
          <Stack.Screen name="(admin)" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )
      ) : (
        <Stack.Screen name="login" />
      )}
    </Stack>
  );
}
