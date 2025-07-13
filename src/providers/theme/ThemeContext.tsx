import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme, Theme } from './themes';

const ThemeContext = createContext<Theme>(LightTheme);

export const useTheme = () => useContext(ThemeContext);

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const colorScheme = useColorScheme();
    const theme = useMemo(() => (colorScheme === 'dark' ? DarkTheme : LightTheme), [colorScheme]);

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};