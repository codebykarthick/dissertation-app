import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, NativeModules, View } from "react-native";
import { Home as HomeIcon, Image as ImageIcon } from "react-native-feather";
import RNFS from 'react-native-fs';
import { launchImageLibrary } from "react-native-image-picker";
import type { Camera as CameraType } from 'react-native-vision-camera';
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { InfoBanner } from "../components/Banners";
import { IconButton } from "../components/Buttons";
import { CameraShutterIcon, TestOutlineIcon, ThemedFlashIcon } from "../components/Icons";
import Colors from "../constants/colors";
import Screens, { PreviewModes } from "../constants/screens";
import { useSnackbar } from "../providers/snackbar/SnackbarContext";
import { useTheme } from "../providers/theme/ThemeContext";

const { CLAHEBridge } = NativeModules;

const CameraScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const [cameraPermission, setCameraPermission] = useState<String>();
    const [flash, setFlash] = useState<'on' | 'off'>('off');
    const { showSnackbar } = useSnackbar();
    const cameraRef = useRef<CameraType>(null);

    const handleImageForPreview = async (sourcePath: string, mode: string) => {
        try {
            const fileName = sourcePath.split('/').pop();
            const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

            await RNFS.copyFile(sourcePath, destPath);
            console.log(`Saved image to: file://${destPath}`);

            // Check if image is blurred using CLAHEBridge
            const isBlurred = await CLAHEBridge.isImageBlurred(destPath);
            if (isBlurred) {
                showSnackbar("Image appears to be blurred. Please try again.", Colors.WARN);
                return;
            }

            navigation.navigate(Screens.PREVIEW, {
                fileUri: `file://${destPath}`,
                mode
            });
        } catch (e) {
            console.error("Failed to prepare image for preview:", e);
            showSnackbar("Could not prepare image for preview", Colors.WARN);
        }
    };

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

            await handleImageForPreview(photo.path, PreviewModes.CAMERA);

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
                    await handleImageForPreview(uri, PreviewModes.UPLOAD);
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
    const white = "#FFFFFF";

    return (
        <View style={{ flex: 1 }}>
            {isCameraOn ? (
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
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'space-between',
                        padding: 20,
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                            <IconButton onPress={navigateHistoryOnPress}>
                                <HomeIcon width={36} height={36} stroke={white} />
                            </IconButton>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <IconButton onPress={openImagePickerOnPress}>
                                <ImageIcon width={36} height={36} stroke={white} />
                            </IconButton>
                            <IconButton onPress={takePhotoOnPress}>
                                <CameraShutterIcon stroke={white} />
                            </IconButton>
                            <IconButton onPress={toggleFlashOnPress}>
                                <ThemedFlashIcon flash={flash} />
                            </IconButton>
                        </View>
                    </View>
                </View>
            ) : (
                <>
                    <InfoBanner style={{ flex: 1, width: '100%' }}>
                        Please allow Camera permission to take photos of test kits in Phone Settings.
                    </InfoBanner>
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'space-between',
                        padding: 20,
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                            <IconButton onPress={navigateHistoryOnPress}>
                                <HomeIcon width={36} height={36} stroke={theme.text} />
                            </IconButton>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <IconButton onPress={openImagePickerOnPress}>
                                <ImageIcon width={36} height={36} stroke={theme.text} />
                            </IconButton>
                        </View>
                    </View>
                </>
            )}
        </View>
    )
}

export default CameraScreen