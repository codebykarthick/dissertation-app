import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Image, View } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { RadioGroup } from "react-native-radio-buttons-group";
import { FillButton, OutlineButton, TextButton } from "../components/Buttons";
import { Subtitle, Title } from "../components/Fonts";
import { Input } from "../components/Inputs";
import Spacer from "../components/Spacer";
import Colors from "../constants/colors";
import Screens, { ModelRadioButtons, PreviewModes, TypeRadioButtons } from "../constants/screens";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useSnackbar } from "../providers/snackbar/SnackbarContext";
import { modelRadioButtonHandler } from "../utils/radioButtonHandler";

type PreviewRouteProp = RouteProp<RootStackParamList, "Preview">;

const PreviewScreen = () => {
    const route = useRoute<PreviewRouteProp>();
    const { fileUri, mode } = route.params;

    const [name, setName] = useState("");
    const [uri, setUri] = useState(fileUri);
    const [selectedType, setSelectedType] = useState<string>("1");
    const [selectedModel, setSelectedModel] = useState<string>("1");
    const warnLabel = mode === PreviewModes.UPLOAD ? "Reupload" : "Retake"
    const { showSnackbar } = useSnackbar();
    const navigation = useNavigation<any>();

    const openImagePickerOnPress = () => {
        launchImageLibrary({ mediaType: "photo", quality: 1, selectionLimit: 1 })
            .then(response => {
                if (response.didCancel || !response.assets || response.assets.length === 0) {
                    showSnackbar("No image was selected!", Colors.WARN);
                    return;
                }

                const uri = response.assets[0]?.uri;
                if (uri) {
                    setUri(uri);
                } else {
                    showSnackbar("Unable to get selected image URI.", Colors.WARN);
                }
            })
            .catch(error => {
                console.log(error);
                showSnackbar("An error occurred while selecting image.", Colors.WARN);
            });
    }

    const handleRedoOnPress = () => {
        if (mode === PreviewModes.UPLOAD) {
            openImagePickerOnPress();
        } else if (mode === PreviewModes.CAMERA) {
            Alert.alert(
                "Discard Current Photo?",
                "The current image will be lost if you proceed.",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Proceed",
                        style: "destructive",
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        }
    }

    const handleEvaluationOnPress = () => {
        if (name.length === 0) {
            Alert.alert("Name cannot be empty!");
            return;
        }

        const selectedModelLabel = modelRadioButtonHandler(selectedModel);
        Alert.alert(
            "Confirm Model Selection",
            `You have selected the model: ${selectedModelLabel}.\n\nThis cannot be changed after evaluation as only Name and Type can be modified later.\n\nAre you sure you want to proceed?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Proceed",
                    onPress: () => {
                        navigation.navigate(Screens.PROCESS, {
                            fileUri: uri,
                            name,
                            selectedType,
                            selectedModel
                        });
                    }
                }
            ]
        );
    }

    const handleCancelOnPress = () => {
        Alert.alert(
            "Discard All Details?",
            "Going back will discard the current image, name, type, and model selections. Are you sure?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Discard",
                    style: "destructive",
                    onPress: () => navigation.pop()
                }
            ]
        );
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <View style={{ paddingLeft: 12, paddingRight: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Title>Photo Preview</Title>
                    <TextButton onPress={handleCancelOnPress} color={Colors.WARN}>Cancel</TextButton>
                </View>
                <Spacer height={16} />
                <Subtitle>Name</Subtitle>
                <Input onChangeText={setName} value={name} />
                <Spacer height={16} />
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
                <Subtitle>Select Type</Subtitle>
                <Spacer height={16} />
                <RadioGroup
                    radioButtons={TypeRadioButtons}
                    onPress={setSelectedType}
                    selectedId={selectedType}
                    layout="row"
                    containerStyle={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%" }}
                />
                <Spacer height={24} />
                <Subtitle>Select Model</Subtitle>
                <Spacer height={16} />
                <RadioGroup
                    radioButtons={ModelRadioButtons}
                    onPress={setSelectedModel}
                    selectedId={selectedModel}
                    layout="row"
                    containerStyle={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%" }}
                />
                <Spacer height={24} />
                <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-evenly" }}>
                    <OutlineButton onPress={handleEvaluationOnPress}>Evaluate</OutlineButton>
                    <FillButton onPress={handleRedoOnPress} color={Colors.WARN}>{warnLabel}</FillButton>
                </View>
            </View>
        </View>
    );
}

export default PreviewScreen;