// mobile/app/(tabs)/rooms.tsx

import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../src/constants';

export default function RoomsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Chat Rooms</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Coming soon...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: COLORS.textSecondary,
  },
});
