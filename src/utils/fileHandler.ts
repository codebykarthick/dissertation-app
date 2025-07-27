import { Buffer } from "buffer";
import { NativeModules } from "react-native";
import RNFS from "react-native-fs";

const { CLAHEBridge } = NativeModules;

export const deleteFileIfExist = async (filepath: string) => {
    const isFileExist = await RNFS.exists(filepath);

    if (isFileExist) {
        console.log("Deleting file at: ", filepath);
        await RNFS.unlink(filepath);
    } else {
        console.log(`No file present at: ${filepath}, skipping.`);
    }
}

export const readPngDataFromFile = async (filepath: string) => {
    try {
        console.log(`Reading: ${filepath}`)
        const rawFile = filepath.replace("file://", "");
        const { width, height, rgbaBuffer } = await CLAHEBridge.readPNGFromFile(rawFile);
        if (!rgbaBuffer) {
            throw new Error("rgbaBuffer is undefined in native response");
        }
        const rgbaData = Buffer.from(rgbaBuffer, 'base64');
        return { width, height, data: rgbaData };
    } catch (err) {
        console.error("Failed to read PNG file:", err);
        throw err;
    }
}