export type Record = {
    id?: number;
    fileUri: string;
    name: string;
    selectedType: string;
    selectedModel: string;
    probability: number;
    uncertainity: number;
    timestamp?: string;
}