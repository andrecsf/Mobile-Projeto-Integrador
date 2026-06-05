import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadows } from '../theme/colors';

import HomeScreen            from '../screens/HomeScreen';
import MinhasSubmissoesScreen from '../screens/MinhasSubmissoesScreen';
import NovaSubmissaoScreen   from '../screens/NovaSubmissaoScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Ícones SVG-less usando apenas Views e Text ────────────────────────────────

function IconHome({ focused }) {
  return (
    <View style={[ic.wrapper, focused && ic.wrapperActive]}>
      {/* Casa: telhado + corpo */}
      <View style={ic.house}>
        <View style={[ic.roof, focused && ic.colorActive]} />
        <View style={[ic.houseBody, focused && ic.bodyActive]}>
          <View style={[ic.door, focused && ic.doorActive]} />
        </View>
      </View>
    </View>
  );
}

function IconList({ focused }) {
  return (
    <View style={[ic.wrapper, focused && ic.wrapperActive]}>
      <View style={ic.listLines}>
        <View style={[ic.line, ic.lineShort, focused && ic.lineActive]} />
        <View style={[ic.line, focused && ic.lineActive]} />
        <View style={[ic.line, ic.lineMedium, focused && ic.lineActive]} />
      </View>
    </View>
  );
}

function IconPlus({ focused }) {
  return (
    <View style={[ic.wrapper, focused ? ic.wrapperPlus : ic.wrapperPlusOff]}>
      <Text style={[ic.plus, focused && ic.plusActive]}>+</Text>
    </View>
  );
}

const ic = StyleSheet.create({
  wrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  wrapperActive: {
    backgroundColor: colors.accentLight,
  },

  // Casa
  house:    { alignItems: 'center' },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.textMuted,
    marginBottom: 1,
  },
  colorActive: { borderBottomColor: colors.accent },
  houseBody: {
    width: 14,
    height: 10,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bodyActive: { backgroundColor: colors.accent },
  door: {
    width: 5,
    height: 6,
    backgroundColor: colors.card,
    borderRadius: 1,
    marginBottom: 0,
  },
  doorActive: { backgroundColor: colors.accentLight },

  // Lista
  listLines: { gap: 3, alignItems: 'flex-start' },
  line: {
    height: 2.5,
    width: 18,
    backgroundColor: colors.textMuted,
    borderRadius: 99,
  },
  lineShort:  { width: 12 },
  lineMedium: { width: 15 },
  lineActive: { backgroundColor: colors.accent },

  // Plus
  wrapperPlus: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  wrapperPlusOff: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus:       { fontSize: 26, lineHeight: 30, color: colors.accentLight, fontWeight: '300' },
  plusActive: { color: colors.white },
});

// ── Label da tab ──────────────────────────────────────────────────────────────
function TabLabel({ label, focused }) {
  return (
    <Text style={{
      fontSize: 10,
      fontWeight: focused ? '700' : '500',
      color: focused ? colors.accent : colors.textMuted,
      marginTop: 2,
    }}>
      {label}
    </Text>
  );
}

// ── Tab Navigator ─────────────────────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 90,
          paddingBottom: 30,
          paddingTop: 8,
          ...shadows.md,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <IconHome focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MinhasSubmissoes"
        component={MinhasSubmissoesScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Submissões" focused={focused} />,
          tabBarIcon: ({ focused }) => <IconList focused={focused} />,
        }}
      />
      <Tab.Screen
        name="NovaSubmissaoTab"
        component={NovaSubmissaoScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Novo" focused={focused} />,
          tabBarIcon: ({ focused }) => <IconPlus focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ── Stack principal ───────────────────────────────────────────────────────────
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="NovaSubmissao"
        component={NovaSubmissaoScreen}
        options={{ headerShown: true, title: 'Nova Submissão' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return <MainStack />;
}