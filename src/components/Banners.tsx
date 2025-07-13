import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useTheme } from "../providers/theme/ThemeContext";


type BannerProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const InfoBanner = ({ children, style }: BannerProps) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.card }, style]}>
            <Text style={[styles.text, theme.typography.banner, { color: theme.text }]}>{children}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        marginVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        textAlign: 'center',
    },
});