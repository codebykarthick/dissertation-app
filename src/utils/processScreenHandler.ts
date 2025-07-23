import { NativeModules } from 'react-native';
import RNFS from "react-native-fs";
import { DatabaseHandler } from "./dbHandler";
import { cropAndMapBack } from './modelHandler';

// TODO: Complete the Android part of the bridge
const { CLAHEBridge } = NativeModules;

// src/utils/ImageProcessingPipeline.ts
export class ImageProcessingPipeline {
    constructor(
        private fileUri: string,
        private name: string,
        private selectedType: string,
        private selectedModel: string,
        private probability: number = Number.NEGATIVE_INFINITY,
        private uncertainity: number = Number.NEGATIVE_INFINITY,
        private databaseHandler = DatabaseHandler.getInstance()
    ) {
    }

    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async roiAndCropImage() {
        let response = await cropAndMapBack(this.fileUri);
        this.fileUri = response!
    }

    async applyContrastEqualisation() {
        try {
            const rawPath = this.fileUri.replace("file://", "");
            console.log("Loading image for CLAHE from: ", rawPath);

            const enhancedUri = await CLAHEBridge.applyClahe(rawPath);

            if (await RNFS.exists(this.fileUri)) {
                await RNFS.unlink(this.fileUri);
                console.log("Deleted resized image at:", this.fileUri);
            }

            this.fileUri = enhancedUri;
            console.log("CLAHE applied. New file path:", this.fileUri);
        } catch (err) {
            console.warn("Failed to apply CLAHE:", err);
        }
    }

    async runModel1() {
        await this.sleep(1000);
        // TODO: actual implementation
    }

    async runModel2() {
        await this.sleep(1000);
        // TODO: actual implementation
    }

    async writeResultsToStorage() {
        if (this.probability === Number.NEGATIVE_INFINITY &&
            this.uncertainity === Number.NEGATIVE_INFINITY) {
            console.log("Adjusting probability and uncertainity with random values.");
            this.probability = Math.random() * 100;
            this.uncertainity = Math.random() * 10;
        }

        let record = {
            fileUri: this.fileUri,
            name: this.name,
            selectedType: this.selectedType,
            selectedModel: this.selectedModel,
            probability: this.probability,
            uncertainity: this.uncertainity
        };

        const insertId = await this.databaseHandler.insertRecord(record)

        if (insertId != null) {
            console.log("Record written to database.", record);
        }

        return insertId
    }

    getSteps(): { label: string; fn: () => Promise<void | null | number> }[] {
        const steps: { label: string; fn: () => Promise<void | null | number> }[] = [
            { label: "Detection Region Of Interest", fn: () => this.roiAndCropImage() },
            { label: "Applying Contrast Equalisation", fn: () => this.applyContrastEqualisation() },
        ];

        if (this.selectedModel === "1" || this.selectedModel === "3") {
            steps.push({ label: "Running Model 1", fn: () => this.runModel1() });
        }
        if (this.selectedModel === "2" || this.selectedModel === "3") {
            steps.push({ label: "Running Model 2", fn: () => this.runModel2() });
        }

        steps.push({ label: "Writing results to Storage", fn: () => this.writeResultsToStorage() });

        return steps;
    }
}