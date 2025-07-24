import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import { Home as HomeIcon, Image as ImageIcon } from "react-native-feather";
import RNFS from 'react-native-fs';
import { launchImageLibrary } from "react-native-image-picker";
import type { Camera as CameraType } from 'react-native-vision-camera';
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { InfoBanner } from "../components/Banners";
import { IconButton } from "../components/Buttons";
import { CameraShutterIcon, TestOutlineIcon, ThemedFlashIcon } from "../components/Icons";
import Spacer from "../components/Spacer";
import Colors from "../constants/colors";
import Screens, { PreviewModes } from "../constants/screens";
import { useSnackbar } from "../providers/snackbar/SnackbarContext";
import { useTheme } from "../providers/theme/ThemeContext";


const CameraScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const [cameraPermission, setCameraPermission] = useState<String>();
    const [flash, setFlash] = useState<'on' | 'off'>('off');
    const { showSnackbar } = useSnackbar();
    const cameraRef = useRef<CameraType>(null);

    // Get screen dimensions for outline sizing
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const outlineWidth = screenWidth * 0.5;
    const outlineHeight = screenHeight * 0.9;

    useEffect(() => {
        (async () => {
            const status = await Camera.getCameraPermissionStatus();
            console.log(`Camera existing status: ${status}`)

            if (status !== "granted") {
                const newStatus = await Camera.requestCameraPermission();
                console.log(`Camera new status: ${newStatus}`)
                setCameraPermission(newStatus);
            } else {
                setCameraPermission(status);
            }
        })();
    }, [])

    const toggleFlashOnPress = () => {
        setFlash(value => value === "on" ? "off" : "on");
    }

    const navigateHistoryOnPress = () => {
        navigation.replace(Screens.HISTORY);
    }

    const takePhotoOnPress = async () => {
        console.log("takePhotoOnPress called.");

        if (cameraRef.current == null) return;

        console.log("Flash setting: ", flash);

        try {
            const photo = await cameraRef.current.takePhoto({
                flash: flash,
                enableShutterSound: true,
            });

            console.log("Captured photo:", photo);

            const sourcePath = photo.path; // e.g., /data/user/0/com.app/cache/photoxyz.jpg
            const fileName = sourcePath.split('/').pop();
            const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

            await RNFS.moveFile(sourcePath, destPath);

            console.log(`Saved photo to: file://${destPath}`);

            navigation.navigate(Screens.PREVIEW, {
                fileUri: `file://${destPath}`,
                mode: PreviewModes.CAMERA
            });

        } catch (e) {
            console.error('Failed to capture photo:', e);
            showSnackbar("Could not take photo", Colors.WARN);
        }
    };

    const openImagePickerOnPress = () => {
        launchImageLibrary({ mediaType: "photo", quality: 1, selectionLimit: 1 })
            .then(async response => {
                if (response.didCancel || !response.assets || response.assets.length === 0) {
                    showSnackbar("No image was selected!", Colors.WARN);
                    return;
                }

                const uri = response.assets[0]?.uri;
                if (uri) {
                    // Uri is a tmp path and can be destroyed at any time, need to move to app storage
                    const fileName = uri.split('/').pop(); // extract the file name
                    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

                    // Copy the image to Documents
                    await RNFS.copyFile(uri, destPath);
                    console.log(`New Path: file://${destPath}`);

                    // Now navigate with the persistent path
                    navigation.navigate(Screens.PREVIEW, { fileUri: `file://${destPath}`, mode: PreviewModes.UPLOAD });
                } else {
                    showSnackbar("Unable to get selected image URI.", Colors.WARN);
                }
            })
            .catch(error => {
                console.log(error);
                showSnackbar("An error occurred while selecting image.", Colors.WARN);
            });
    }

    const cameraDevice = useCameraDevice('back');
    const isCameraOn = cameraDevice && cameraPermission === "granted"

    console.log(theme.text);

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <IconButton onPress={navigateHistoryOnPress}><HomeIcon width={36} height={36} stroke={theme.text} /></IconButton>
            <Spacer height={16} />
            <View style={{ height: "80%" }}>
                {isCameraOn ? <>
                    <View style={{ flex: 1, position: 'relative' }}>
                        <Camera
                            ref={cameraRef}
                            photo={true}
                            device={cameraDevice}
                            isActive={true}
                            style={{ flex: 1 }}
                            photoQualityBalance="quality"
                        />
                        <View style={{
                            position: 'absolute',
                            top: '37%',
                            left: '50%',
                            width: outlineWidth,
                            height: outlineHeight,
                            transform: [
                                { translateX: -0.5 * outlineWidth },
                                { translateY: -0.5 * outlineHeight }
                            ],
                            opacity: 0.6,
                        }}>
                            <TestOutlineIcon stroke={theme.primary} width={outlineWidth} height={outlineHeight} />
                        </View>
                    </View>
                </> :
                    <InfoBanner style={{ flex: 1, width: '100%' }}>Please allow Camera permission to take photos of test kits in Phone Settings.</InfoBanner>}
            </View>
            <Spacer height={28} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <IconButton onPress={openImagePickerOnPress}><ImageIcon width={36} height={36} stroke={theme.text} /></IconButton>
                {isCameraOn && (
                    <>
                        <IconButton onPress={takePhotoOnPress}>
                            <CameraShutterIcon stroke={theme.text} />
                        </IconButton>
                        <IconButton onPress={toggleFlashOnPress}><ThemedFlashIcon flash={flash} /></IconButton>
                    </>
                )}
            </View>
        </View>
    )
}

export default CameraScreen