import { DefaultTheme, NavigationContainer, DarkTheme as NavigationDarkTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import Colors from '../constants/colors';
import { useSnackbar } from '../providers/snackbar/SnackbarContext';
import { useTheme } from '../providers/theme/ThemeContext';
import CameraScreen from '../screens/CameraScreen';
import DisclaimerScreen from '../screens/DisclaimerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import InfoScreen from '../screens/InfoScreen';
import PreviewScreen from '../screens/PreviewScreen';
import ProcessScreen from '../screens/ProcessScreen';
import ResultScreen from '../screens/ResultScreen';
import { Record } from '../types/DBTypes';
import { hasAcceptedDisclaimer } from '../utils/disclaimerStorage';

export type RootStackParamList = {
    Disclaimer: undefined;
    Camera: undefined;
    History: undefined;
    Preview: { fileUri: string, mode: string };
    Process: { fileUri: string, name: string, selectedType: string, selectedModel: string };
    Result: { id: number };
    Info: { record: Record }
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
    const theme = useTheme();
    const baseTheme = theme.mode === 'dark' ? NavigationDarkTheme : DefaultTheme;
    const { showSnackbar } = useSnackbar();

    const navTheme: NavigationTheme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            background: theme.background,
            text: theme.text,
            primary: theme.primary,
            card: theme.card,
            border: 'transparent',
            notification: theme.primary,
        },
    };

    useEffect(() => {
        const checkDisclaimer = async () => {
            const accepted = await hasAcceptedDisclaimer();
            setInitialRoute(accepted ? 'Camera' : 'Disclaimer');
            if (accepted) {
                showSnackbar('Disclaimer is already accepted!', Colors.PRIMARY, 3000);
            }
        };
        checkDisclaimer();
    }, []);

    if (!initialRoute) return null;

    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
                <Stack.Screen name="Camera" component={CameraScreen} />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="Preview" component={PreviewScreen} />
                <Stack.Screen name="Process" component={ProcessScreen} />
                <Stack.Screen name="Result" component={ResultScreen} />
                <Stack.Screen name="Info" component={InfoScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;