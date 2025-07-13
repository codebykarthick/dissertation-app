import { Text, TextStyle } from "react-native";
import { useTheme } from "../providers/theme/ThemeContext";

type FontProps = {
    children: React.ReactNode;
    style?: TextStyle; // optional override for flexibility
};

export const H1 = ({ children, style }: FontProps) => {
    const theme = useTheme();

    return (
        <Text style={[{ color: theme.text }, theme.typography.h1, style]}>
            {children}
        </Text>
    );
};

export const Title = ({ children, style }: FontProps) => {
    const theme = useTheme();

    return (
        <Text style={[{ color: theme.text }, theme.typography.title, style]}>
            {children}
        </Text>
    );
};

export const Subtitle = ({ children, style }: FontProps) => {
    const theme = useTheme();

    return (
        <Text style={[{ color: theme.text }, theme.typography.subtitle, style]}>
            {children}
        </Text>
    );
};

export const P = ({ children, style }: FontProps) => {
    const theme = useTheme();

    return (
        <Text style={[{ color: theme.text }, theme.typography.body, style]}>
            {children}
        </Text>
    );
};