import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import Screens from "../constants/screens";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../providers/theme/ThemeContext";
import { ImageProcessingPipeline } from "../utils/processScreenHandler";

type ProcessRouteProp = RouteProp<RootStackParamList, "Process">

const ProcessScreen = () => {
    const route = useRoute<ProcessRouteProp>();
    const { fileUri, name, selectedType, selectedModel } = route.params;

    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState<string>("Starting");

    useEffect(() => {
        const runProcess = async () => {
            const processor = new ImageProcessingPipeline(fileUri, name, selectedType, selectedModel);
            const steps = processor.getSteps();

            const total = steps.length;
            let insertId: number | null = null;

            for (let i = 0; i < total; i++) {
                setCurrentStep(steps[i].label);
                const result = await steps[i].fn();
                setProgress((i + 1) / total);

                // Capture insertId if returned by final step
                if (i === total - 1) {
                    insertId = result ?? null;
                }
            }

            if (insertId !== null) {
                navigation.replace(Screens.RESULT, { id: insertId });
            }
        };

        runProcess();
    }, []);

    return (
        <View style={styles.container}>
            <Progress.Circle
                size={200}
                progress={progress}
                thickness={10}
                showsText
                color={theme.primary}
                formatText={() => `${Math.round(progress * 100)}%`}
            />
            <Text style={styles.stepText}>{currentStep}</Text>
        </View>
    );
}

export default ProcessScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    stepText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: "500",
    },
});