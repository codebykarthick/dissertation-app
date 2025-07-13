const typography = {
    h1: {
        fontSize: 36,
        fontWeight: 'bold' as const,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold' as const,
    },
    banner: {
        fontSize: 20,
        fontWeight: 'medium' as const,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold' as const,
    },
    boldBody: {
        fontSize: 16,
        fontWeight: 'bold' as const,
    },
    body: {
        fontSize: 16,
        fontWeight: 'normal' as const,
    },
    softBody: {
        fontSize: 14,
        fontWeight: 'ultralight' as const,
    }
}

export const LightTheme = {
    mode: 'light',
    background: '#FFFFFF',
    text: '#000000',
    softText: '#888888',
    primary: '#6200EE',
    secondary: '#03DAC6',
    warning: '#B00020',
    okay: '#388E3C',
    card: '#F5F5F5',
    typography
};

export const DarkTheme = {
    mode: 'dark',
    background: '#000000',
    text: '#FFFFFF',
    softText: '#BBBBBB',
    primary: '#BB86FC',
    secondary: '#03DAC6',
    warning: '#CF6679',
    okay: '#4CAF50',
    card: '#121212',
    typography
};

export type Theme = typeof LightTheme;