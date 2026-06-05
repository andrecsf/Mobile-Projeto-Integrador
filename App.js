import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme/colors';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [logado, setLogado] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        {logado
          ? <AppNavigator />
          : <AuthNavigator onLogin={() => setLogado(true)} />
        }
      </NavigationContainer>
    </SafeAreaProvider>
  );
}