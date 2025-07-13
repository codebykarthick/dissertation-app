import { DatabaseHandler } from "./dbHandler";

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

    async resizeAndConvertToTensors() {
        await this.sleep(1000);
        // TODO: actual implementation
    }

    async applyContrastEqualisation() {
        await this.sleep(1000);
        // TODO: actual implementation
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
            { label: "Resizing image and converting to Tensors", fn: () => this.resizeAndConvertToTensors() },
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