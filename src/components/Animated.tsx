import { useEffect, useState } from 'react';
import * as Progress from 'react-native-progress';
import { useTheme } from '../providers/theme/ThemeContext';
import { Record } from "../types/DBTypes";
import { getProbabilityColor } from "../utils/colorHandler";

export const AnimatedProgressBar = ({ record }: { record: Record }) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const [animatedUncertainty, setAnimatedUncertainty] = useState(0);
    const theme = useTheme();

    useEffect(() => {
        if (record) {
            let frame = 0;
            const maxFrames = 60;
            const targetProb = record.probability / 100;
            const targetUncertainty = record.uncertainity;
            const interval = setInterval(() => {
                frame++;
                const progress = targetProb * (frame / maxFrames);
                const uncert = targetUncertainty * (frame / maxFrames);
                setAnimatedProgress(progress);
                setAnimatedUncertainty(uncert);
                if (frame >= maxFrames) {
                    clearInterval(interval);
                }
            }, 10);
            return () => clearInterval(interval);
        }
    }, [record]);

    return <Progress.Circle
        size={120}
        progress={animatedProgress}
        showsText={true}
        formatText={() => {
            const uncertaintyDisplay = record.uncertainity < 0.01 ? '' : ` ± ${Math.round(animatedUncertainty)}%`;
            return `${Math.round(animatedProgress * 100)}%${uncertaintyDisplay}`;
        }}
        color={getProbabilityColor(record.probability)}
        unfilledColor="#e0e0e0"
        borderWidth={0}
        thickness={8}
        textStyle={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}
    />
}