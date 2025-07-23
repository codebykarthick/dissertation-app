import ImageResizer from '@bam.tech/react-native-image-resizer';
import ImageEditor from '@react-native-community/image-editor';
import { Buffer } from 'buffer';
import jpeg from 'jpeg-js';
import * as ort from "onnxruntime-react-native";
import { Image, Platform } from 'react-native';
import RNFS from 'react-native-fs';

async function getModelPath(modelType: "yolo.onnx" | "efficientnet.onnx" | "shufflenet.onnx") {
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
        modelPath = `${RNFS.MainBundlePath}/${modelType}`;
    }

    let fileExists = await RNFS.exists(modelPath)

    if (!fileExists) {
        console.error("Model does not exist at: ", modelPath);
    } else {
        console.log("Model is present at: ", modelPath);
    }

    return modelPath;
}

export async function cropAndMapBack(fileUri: string) {
    let croppedUri;

    try {
        console.log("CropAndMapBack method called");

        // Get original image dimensions (before resize)
        const uriForSize = fileUri.replace('file://', '');
        const { width: originalWidth, height: originalHeight } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            Image.getSize(uriForSize, (w, h) => resolve({ width: w, height: h }), reject);
        });
        console.log(`Original dimensions: ${originalWidth}x${originalHeight}`);

        // Get the model path
        const roiModelPath = await getModelPath("yolo.onnx");

        // Create the session
        console.log("Creating session from: ", roiModelPath);

        const session = await ort.InferenceSession.create(roiModelPath);

        console.log("Session created successfully!");

        // Resize the image to 640x640
        const resizedImage = await ImageResizer.createResizedImage(
            fileUri,
            640,
            640,
            'JPEG',
            100
        );
        const resizedPath = resizedImage.path;

        // Load the resized image as base64
        const imageBase64 = await RNFS.readFile(resizedPath, 'base64');
        // Convert to raw buffer
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        // Decode JPEG to RGBA pixel data
        const decoded = jpeg.decode(imageBuffer, { useTArray: true });
        const { width, height, data } = decoded;

        console.log(`Dimensions: ${width}x${height}`);

        // Prepare a zero-padded Float32Array in [1, 3, 640, 640] (CHW) format
        const targetWidth = 640;
        const targetHeight = 640;
        const floatData = new Float32Array(1 * 3 * targetHeight * targetWidth); // zero-initialized

        // Copy resized image data into top-left of tensor
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x);
                const r = data[pixelIndex * 4] / 255.0;
                const g = data[pixelIndex * 4 + 1] / 255.0;
                const b = data[pixelIndex * 4 + 2] / 255.0;

                const chwIndex = y * targetWidth + x;
                floatData[chwIndex] = r;                           // R
                floatData[chwIndex + targetWidth * targetHeight] = g; // G
                floatData[chwIndex + 2 * targetWidth * targetHeight] = b; // B
            }
        }
        const inputTensor = new ort.Tensor('float32', floatData, [1, 3, targetHeight, targetWidth]);

        // Run inference on the YOLO model
        const feeds: Record<string, ort.Tensor> = { [session.inputNames[0]]: inputTensor };

        const outputMap = await session.run(feeds);
        console.log("Inference run. ", outputMap);

        // === Post‑process: pick highest‑confidence box and map back to original ===
        const detections = outputMap.output0.data as Float32Array;
        // Each detection is 6 floats [x1,y1,x2,y2,score,classId]
        let bestIdx = 0;
        let bestScore = -Infinity;
        const numDetections = detections.length / 6;
        for (let i = 0; i < numDetections; i++) {
            const score = detections[i * 6 + 4];
            if (score > bestScore) {
                bestScore = score;
                bestIdx = i;
            }
        }
        const base = bestIdx * 6;
        const x1 = detections[base];
        const y1 = detections[base + 1];
        const x2 = detections[base + 2];
        const y2 = detections[base + 3];
        console.log(`Top detection (model coords): [${x1}, ${y1}] to [${x2}, ${y2}] (score=${bestScore.toFixed(3)})`);

        // Map back to original image coords
        const scaleX = originalWidth / width;   // width = resized image width (e.g. 190)
        const scaleY = originalHeight / height; // height = resized image height (e.g. 640)

        const origX1 = Math.max(0, Math.min(originalWidth, x1 * scaleX));
        const origY1 = Math.max(0, Math.min(originalHeight, y1 * scaleY));
        const origX2 = Math.max(0, Math.min(originalWidth, x2 * scaleX));
        const origY2 = Math.max(0, Math.min(originalHeight, y2 * scaleY));

        console.log(`Mapped to original: [${origX1}, ${origY1}] to [${origX2}, ${origY2}]`);


        // Crop the original image using ImageEditor
        try {
            const cropData = {
                offset: { x: origX1, y: origY1 },
                size: { width: origX2 - origX1, height: origY2 - origY1 },
                format: "jpeg"
            } as const;
            croppedUri = await ImageEditor.cropImage(fileUri, cropData);
            console.log('Cropped image saved at: ', croppedUri);
        } catch (cropErr) {
            console.error('Failed to crop image:', cropErr);
        }

        console.log(`${croppedUri?.width}x${croppedUri?.height}`)

        // Check if croppedUri is defined
        if (!croppedUri) {
            throw new Error("croppedUri is undefined. Cropping may have failed.");
        }

        return croppedUri.uri;

    } catch (err) {
        console.error("Error during model session creation or inference: ", err);
    }
}