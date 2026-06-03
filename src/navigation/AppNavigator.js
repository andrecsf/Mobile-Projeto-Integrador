import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import MinhasSubmissoesScreen from '../screens/MinhasSubmissoesScreen';
import NovaSubmissaoScreen from '../screens/NovaSubmissaoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack que engloba as telas do Tab + NovaSubmissao como tela de pilha
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tela principal com as abas */}
      <Stack.Screen name="Tabs" component={TabNavigator} />

      {/* NovaSubmissao abre por cima das abas (sem tab bar) */}
      <Stack.Screen
        name="NovaSubmissao"
        component={NovaSubmissaoScreen}
        options={{ headerShown: true, title: 'Nova Submissão' }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator com as três abas principais
function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="MinhasSubmissoes"
        component={MinhasSubmissoesScreen}
        options={{ tabBarLabel: 'Minhas Submissões' }}
      />
      <Tab.Screen
        name="NovaSubmissaoTab"
        component={NovaSubmissaoScreen}
        options={{ tabBarLabel: 'Nova Submissão' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return <MainStack />;
}