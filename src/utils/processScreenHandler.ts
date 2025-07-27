import { NativeModules } from 'react-native';
import { DatabaseHandler } from "./dbHandler";
import { deleteFileIfExist } from './fileHandler';
import { cropAndMapBack, runEfficientNetInference, runShuffleNetInference } from './modelHandler';

const { CLAHEBridge } = NativeModules;

// src/utils/ImageProcessingPipeline.ts
export class ImageProcessingPipeline {
    private croppedUri: string = "";

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

    async roiAndCropImage() {
        let response = await cropAndMapBack(this.fileUri);
        // Store the intermediates in croppedUri
        this.croppedUri = response! as string
    }

    async applyContrastEqualisation() {
        try {
            const rawPath = this.croppedUri.replace("file://", "");
            console.log("Loading image for CLAHE from: ", rawPath);

            const enhancedUri = await CLAHEBridge.applyClahe(rawPath);

            await deleteFileIfExist(this.croppedUri);

            this.croppedUri = enhancedUri;
            console.log("CLAHE applied. New file path:", this.croppedUri);
        } catch (err) {
            console.warn("Failed to apply CLAHE:", err);
        }
    }

    async runModel1() {
        const result = await runEfficientNetInference(this.croppedUri);
        if (!result) throw new Error("Inference failed!");

        this.probability = result.mean;
        this.uncertainity = result.stdDev;
    }

    async runModel2() {
        const result = await runShuffleNetInference(this.croppedUri);
        if (!result) throw new Error("Inference failed!");

        if (this.probability === Number.NEGATIVE_INFINITY) {
            // Model 2 is run separately
            this.probability = result.mean;
            this.uncertainity = result.stdDev;
        } else {
            // Model 2 is run in Ensemble mode with weighted averaging
            const weight1 = 0.7;
            const weight2 = 1 - weight1;

            this.probability = (this.probability * weight1) + (result.mean * weight2);
            this.uncertainity = (this.uncertainity * weight1) + (result.stdDev * weight2);
        }
    }

    async writeResultsToStorage() {
        // Delete the temp CroppedUri
        // await deleteFileIfExist(this.croppedUri);

        if (this.probability === Number.NEGATIVE_INFINITY &&
            this.uncertainity === Number.NEGATIVE_INFINITY) {
            console.log("Adjusting probability and uncertainity with random values.");
            this.probability = Math.random() * 100;
            this.uncertainity = Math.random() * 10;
        }

        // TODO: Should send this.fileUri instead. This is only for debugging.
        let record = {
            fileUri: this.croppedUri,
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