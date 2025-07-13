import { View } from 'react-native';

type SpacerProps = {
    height?: number;
    width?: number;
};

const Spacer = ({ height = 0, width = 0 }: SpacerProps) => (
    <View style={{ height, width }} />
);

export default Spacer;