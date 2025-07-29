import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { ArrowLeft as LeftArrowIcon } from "react-native-feather";
import { RadioGroup } from "react-native-radio-buttons-group";
import { AnimatedProgressBar } from "../components/Animated";
import { IconButton, TextButton } from "../components/Buttons";
import { Title } from "../components/Fonts";
import { Input } from "../components/Inputs";
import Spacer from "../components/Spacer";
import Colors from "../constants/colors";
import { TypeRadioButtons } from "../constants/screens";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../providers/theme/ThemeContext";
import { Record } from "../types/DBTypes";
import { DatabaseHandler } from "../utils/dbHandler";
import { modelRadioButtonHandler, typeRadioButtonHandler } from "../utils/radioButtonHandler";

type InfoScreenRouteProps = RouteProp<RootStackParamList, "Info">

const InfoScreen = () => {
    const route = useRoute<InfoScreenRouteProps>();
    const { record: item } = route.params;
    const [name, setName] = useState<string>(item.name);
    const [selectedType, setSelectedType] = useState<string>(item.selectedType);
    const [record, setRecord] = useState<Record>(item);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [classification, setClassification] = useState<string>("Positive");
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const databaseHandler = DatabaseHandler.getInstance();

    const navigateBackOnPress = () => {
        navigation.pop()
    }

    const handleEditOnPress = () => {
        setIsEdit(true);
    }

    const handleSaveOnPress = async () => {
        await databaseHandler.updateRecord(record.id!, {
            name,
            selectedType
        });
        setRecord({ ...record, name, selectedType });
        console.log("Record updated successfully!")
        setIsEdit(false);
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <View style={{ paddingHorizontal: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <View style={{ position: "absolute", left: 0 }}>
                        <IconButton onPress={navigateBackOnPress}>
                            <LeftArrowIcon height={28} width={28} stroke={theme.text} />
                        </IconButton>
                    </View>
                    <Title>Photo Information</Title>
                    <View style={{ position: "absolute", right: 0 }}>
                        {isEdit ?
                            <TextButton onPress={handleSaveOnPress} color={Colors.OKAY}>Save</TextButton> :
                            <TextButton onPress={handleEditOnPress} color={Colors.PRIMARY}>Edit</TextButton>
                        }
                    </View>
                </View>
                <Spacer height={24} />
                <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
                    <Image
                        source={{ uri: record.fileUri }}
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
                            <Text style={[theme.typography.boldBody, { color: theme.text }]}>
                                Name: {!isEdit && <Text style={[theme.typography.body, { color: theme.text }]}>{record.name}</Text>}
                            </Text>
                            {isEdit && <Input onChangeText={setName} value={name} />}
                            <Text style={[theme.typography.boldBody, { color: theme.text }]}>
                                Date: <Text style={[theme.typography.body, { color: theme.text }]}>{record.timestamp}</Text>
                            </Text>
                            <Text style={[theme.typography.boldBody, { color: theme.text }]}>
                                Type: {!isEdit && <Text style={[theme.typography.body, { color: theme.text }]}>{typeRadioButtonHandler(record.selectedType)}</Text>}
                            </Text>
                            {isEdit && <RadioGroup
                                radioButtons={TypeRadioButtons}
                                onPress={setSelectedType}
                                selectedId={selectedType}
                                layout="row"
                                containerStyle={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", paddingVertical: 4 }}
                            />}
                            <Text style={[theme.typography.boldBody, { color: theme.text }]}>
                                Model: <Text style={[theme.typography.body, { color: theme.text }]}>{modelRadioButtonHandler(record.selectedModel)}</Text>
                            </Text>
                            <Text style={[theme.typography.boldBody, { color: theme.text }]}>
                                Classification: <Text style={[theme.typography.body, { color: theme.text }]}>{classification}</Text>
                            </Text>
                            <Spacer height={16} />
                            <Text style={[theme.typography.boldBody, { marginBottom: 12 }, { color: theme.text }]}>
                                Probability of Positive Result:
                            </Text>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <AnimatedProgressBar record={record} />
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    )
}

export default InfoScreen;