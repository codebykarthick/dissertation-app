import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import HomeIcon from "../assets/icons/home.svg";
import { FillButton, IconButton } from "../components/Buttons";
import { Title } from "../components/Fonts";
import Spacer from "../components/Spacer";
import Colors from "../constants/colors";
import Screens from "../constants/screens";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../providers/theme/ThemeContext";
import { Record } from "../types/DBTypes";

import { AnimatedProgressBar } from "../components/Animated";
import { DatabaseHandler } from "../utils/dbHandler";
import { modelRadioButtonHandler, typeRadioButtonHandler } from "../utils/radioButtonHandler";

type ResultRouteProp = RouteProp<RootStackParamList, "Result">

const ResultScreen = () => {
    const route = useRoute<ResultRouteProp>();
    const { id } = route.params;
    const databaseHandler = DatabaseHandler.getInstance();
    const [record, setRecord] = useState<Record | null>(null);
    const [uri, setUri] = useState<string | undefined>();
    const theme = useTheme();
    const navigation = useNavigation<any>();

    const fetchRecord = async () => {
        const result = await databaseHandler.getRecordById(id);
        setRecord(result);
        setUri(result?.fileUri)
    };

    const navigateHistoryOnPress = () => {
        navigation.replace(Screens.HISTORY);
    }

    useEffect(() => {
        fetchRecord();
    }, []);



    return (
        <View style={{ flex: 1, padding: 20 }}>
            <View style={{ paddingHorizontal: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <View style={{ position: "absolute", left: 0 }}>
                        <IconButton onPress={navigateHistoryOnPress}>
                            <HomeIcon height={28} width={28} stroke={theme.text} />
                        </IconButton>
                    </View>
                    <Title>Evaluation Result</Title>
                </View>
                <Spacer height={24} />
                <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
                    <Image
                        source={{ uri }}
                        style={{
                            width: '100%',
                            aspectRatio: 1,
                            borderRadius: 8,
                            backgroundColor: 'black',
                            alignSelf: 'center'
                        }}
                        resizeMode="contain"
                    />
                    <Spacer height={24} />
                    {record && (
                        <View style={{ gap: 8 }}>
                            <Text style={theme.typography.boldBody}>
                                Name: <Text style={theme.typography.body}>{record.name}</Text>
                            </Text>
                            <Text style={theme.typography.boldBody}>
                                Date: <Text style={theme.typography.body}>{record.timestamp}</Text>
                            </Text>
                            <Text style={theme.typography.boldBody}>
                                Type: <Text style={theme.typography.body}>{typeRadioButtonHandler(record.selectedType)}</Text>
                            </Text>
                            <Text style={theme.typography.boldBody}>
                                Model: <Text style={theme.typography.body}>{modelRadioButtonHandler(record.selectedModel)}</Text>
                            </Text>
                            <Text style={[theme.typography.boldBody, { marginBottom: 12 }]}>
                                Probability of Positive Result:
                            </Text>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <AnimatedProgressBar record={record} />
                                <Spacer height={8} />
                                <FillButton onPress={navigateHistoryOnPress} color={Colors.OKAY}>Done</FillButton>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    )
}

export default ResultScreen