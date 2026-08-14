import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { ColorValue, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useStrings } from '@/lib/i18n';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: ColorValue;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const strings = useStrings();
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#334155' : '#e2e8f0',
          height: 56 + tabBarBottom,
          paddingBottom: tabBarBottom,
          paddingTop: 6,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: strings('tabs.home'),
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: strings('tabs.quran'),
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="letters"
        options={{
          title: strings('tabs.letters'),
          tabBarIcon: ({ color }) => <TabBarIcon name="graduation-cap" color={color} />,
        }}
      />
      <Tabs.Screen
        name="zikr"
        options={{
          title: strings('tabs.zikr'),
          tabBarIcon: ({ color }) => <TabBarIcon name="repeat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: strings('tabs.prayer'),
          tabBarIcon: ({ color }) => <TabBarIcon name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: strings('tabs.favorites'),
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: strings('tabs.profile'),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
