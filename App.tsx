/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StyleSheet, useColorScheme } from 'react-native';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { SnackbarProvider } from './src/providers/snackbar/SnackbarContext';
import { AppThemeProvider } from './src/providers/theme/ThemeContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AppThemeProvider>
      <SafeAreaProvider>
        <SnackbarProvider>
          <SafeAreaView style={styles.container}>
            <AppNavigator />
          </SafeAreaView>
        </SnackbarProvider>
      </SafeAreaProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
