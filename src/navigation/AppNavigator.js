import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import MinhasSubmissoesScreen from '../screens/MinhasSubmissoesScreen';
import NovaSubmissaoScreen from '../screens/NovaSubmissaoScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Minhas Submissões" component={MinhasSubmissoesScreen} />
      <Tab.Screen name="Nova Submissão" component={NovaSubmissaoScreen} />
    </Tab.Navigator>
  );
} 
