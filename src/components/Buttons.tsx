import { GestureResponderEvent, StyleProp, Text, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "../providers/theme/ThemeContext";
import { returnColorForConstant } from "../utils/colorHandler";


type ButtonProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    capitalise?: boolean;
    color?: string;
    onPress?: (event: GestureResponderEvent) => void
}


export const TextButton = ({ children, style, capitalise, color, onPress }: ButtonProps) => {
    const theme = useTheme();
    const backgroundColor = returnColorForConstant(color!);

    return (
        <TouchableOpacity style={style} onPress={onPress}>
            <Text style={[
                theme.typography.body,
                { color: backgroundColor, fontWeight: "bold" },
                capitalise && { textTransform: "uppercase" }]}>
                {children}
            </Text>
        </TouchableOpacity>
    )
}

export const OutlineButton = ({ children, style, capitalise, color, onPress }: ButtonProps) => {
    const theme = useTheme();
    const backgroundColor = returnColorForConstant(color!);

    return (
        <TouchableOpacity
            style={[
                {
                    borderWidth: 1.5,
                    borderRadius: 12,
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: backgroundColor,
                },
                style
            ]}
            onPress={onPress}
        >
            <Text style={[
                theme.typography.boldBody,
                { color: backgroundColor },
                capitalise && { textTransform: "uppercase" }
            ]}>
                {children}
            </Text>
        </TouchableOpacity>
    )
}

export const FillButton = ({ children, style, capitalise, color, onPress }: ButtonProps) => {
    const theme = useTheme();
    const backgroundColor = returnColorForConstant(color!);

    return (
        <TouchableOpacity
            style={[
                {
                    borderRadius: 12,
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: backgroundColor,
                },
                style
            ]}
            onPress={onPress}
        >
            <Text style={[
                theme.typography.boldBody,
                { color: theme.background },
                capitalise && { textTransform: "uppercase" }
            ]}>
                {children}
            </Text>
        </TouchableOpacity>
    )
}

export const IconButton = ({ children, style, onPress }: ButtonProps) => {
    return (
        <TouchableOpacity style={style} onPress={onPress}>
            {children}
        </TouchableOpacity>
    );
};


export const FloatingActionButton = ({ children, style, onPress }: ButtonProps) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[
                {
                    backgroundColor: theme.primary,
                    borderRadius: 28,
                    width: 56,
                    height: 56,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    elevation: 6,
                },
                style
            ]}
            onPress={onPress}
        >
            {children}
        </TouchableOpacity>
    );
};

