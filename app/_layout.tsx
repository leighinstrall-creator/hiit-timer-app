import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  useFonts,
} from '@expo-google-fonts/jetbrains-mono';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WorkoutProvider } from '@/workout/WorkoutProvider';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  // The whole design is set in JetBrains Mono; rendering before it resolves
  // would flash a fallback face and reflow every screen.
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <WorkoutProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </WorkoutProvider>
    </SafeAreaProvider>
  );
}
