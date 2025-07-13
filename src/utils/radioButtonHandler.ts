import { ModelRadioButtons, TypeRadioButtons } from "../constants/screens";

export const typeRadioButtonHandler = (id: string): string => {
    const match = TypeRadioButtons.find((value) => value.id === id);
    return match ? match.label : "Invalid";
}

export const modelRadioButtonHandler = (id: string): string => {
    const match = ModelRadioButtons.find((value) => value.id === id);
    return match ? match.label : "Invalid";
}