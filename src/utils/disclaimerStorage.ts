import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCLAIMER_KEY = 'disclaimerAccepted';

export const hasAcceptedDisclaimer: () => Promise<boolean> = async () => {
    const value = await AsyncStorage.getItem(DISCLAIMER_KEY);
    return value === 'true';
};

export const acceptDisclaimer: () => Promise<void> = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
};