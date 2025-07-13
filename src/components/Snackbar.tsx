// Snackbar.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../constants/colors';
import { useTheme } from '../providers/theme/ThemeContext';
import { returnColorForConstant } from '../utils/colorHandler';

type SnackbarProps = {
    message: string,
    color?: string
}

const Snackbar = ({ message, color = Colors.PRIMARY }: SnackbarProps) => {
    const theme = useTheme();
    let backgroundColor = returnColorForConstant(color);

    return (
        <View style={[styles.container, { backgroundColor: backgroundColor }]}>
            <Text style={[theme.typography.boldBody, { color: theme.background }]}>
                {message}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 8,
        zIndex: 9999,
        alignItems: 'center',
        elevation: 4,
    },
});

export default Snackbar;