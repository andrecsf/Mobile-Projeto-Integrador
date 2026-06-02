import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [logado, setLogado] = useState(false);

  return (
    <NavigationContainer>
      {logado
        ? <AppNavigator />
        : <AuthNavigator onLogin={() => setLogado(true)} />
      }
    </NavigationContainer>
  );
}