import FlashOffIcon from "../assets/icons/flash_off.svg";
import FlashOnIcon from "../assets/icons/flash_on.svg";
import { useTheme } from "../providers/theme/ThemeContext";

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
