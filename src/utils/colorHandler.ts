import Colors from "../constants/colors";
import { useTheme } from "../providers/theme/ThemeContext";

export const returnColorForConstant = (color: string) => {
    const theme = useTheme();

    switch (color) {
        case Colors.PRIMARY: return theme.primary;
        case Colors.SECONDARY: return theme.secondary;
        case Colors.WARN: return theme.warning;
        case Colors.OKAY: return theme.okay;
        default: return theme.primary;
    }
}

export const getProbabilityColor = (value: number) => {
    if (value <= 25) return '#006400'; // dark green
    if (value <= 50) return '#32CD32'; // light green
    if (value <= 75) return '#FFD700'; // yellow
    if (value <= 90) return '#FFA500'; // orange
    return '#FF0000'; // red
};