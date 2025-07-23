import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { ImageUtil, media, torch } from 'react-native-pytorch-core';

async function loadModel(modelType: "mobile_crop.pt" | "mobile_shufflenet.pt" | "mobile_efficientnet.pt") {
    // Determine the correct path for the model based on the platform
    let modelPath: string;

    if (Platform.OS === 'android') {
        // TODO: CHECK IF THE MODELS EXIST IN ANDROID
        // Copy the model file from Android assets to the document directory if not already present
        const destPath = `${RNFS.DocumentDirectoryPath}/${modelType}`;
        const fileExists = await RNFS.exists(destPath);
        if (!fileExists) {
            // modelType should match the filename in android/app/src/main/assets
            await RNFS.copyFileAssets(modelType, destPath);
        }
        modelPath = destPath;
    } else {
        // iOS: models are bundled in the main bundle directory
        modelPath = `${RNFS.MainBundlePath}/models/${modelType}`;
    }
    // Load and return the TorchScript model for mobile
    return torch.jit._loadForMobile(modelPath);
}

export async function cropAndMapBack(fileUri: string) {
    const roiModel = await loadModel("mobile_crop.pt")

    const image = await ImageUtil.fromFile(fileUri);
    let imageWidth = image.getWidth();
    let imageHeight = image.getHeight();
    const blob = media.toBlob(image);

    let tensor = torch.fromBlob(blob, [imageHeight, imageWidth, 3]);
    tensor = tensor.permute([2, 0, 1]);
    tensor = tensor.div(255);
    tensor = tensor.unsqueeze(0);

    let output = (await roiModel.forward(tensor));

    console.log(output);
}