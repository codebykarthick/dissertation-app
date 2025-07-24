import { ZapOff as FlashOffIcon, Zap as FlashOnIcon } from "react-native-feather";
import Svg, { Circle, Rect } from "react-native-svg";
import { useTheme } from "../providers/theme/ThemeContext";

type IconProps = {
    stroke: string;
    width?: number | string;
    height?: number | string;
}

export const ThemedFlashIcon = ({ flash }: { flash: 'on' | 'off' }) => {
    const theme = useTheme();

    if (flash === "on") {
        return (
            <FlashOnIcon
                width={36}
                height={36}
                stroke={theme.text}
            />
        )
    }

    return (
        <FlashOffIcon
            width={36}
            height={36}
            stroke={theme.text}
        />
    )
};

export const CameraShutterIcon = (props: IconProps) => (
    <Svg width={72} height={72} viewBox="0 0 72 72" fill="none" {...props}>
        <Circle cx="36" cy="36" r="30" stroke={props.stroke} strokeWidth={4} fill="none" />
        <Circle cx="36" cy="36" r="20" fill={props.stroke} />
    </Svg>
);

export const TestOutlineIcon = (props: IconProps) => {
    return (
        <Svg width={props.width} height={props.height} viewBox="0 0 60 120" fill="none" {...props}>
            <Rect
                x={4}
                y={4}
                width={52}
                height={156}
                rx={12}
                ry={12}
                stroke={props.stroke}
                strokeWidth={2}
                fill="none"
            />
        </Svg>
    );
}