import CheckBox from "@react-native-community/checkbox"
import { useNavigation } from "@react-navigation/native"
import { Image, Text, TouchableOpacity, View } from "react-native"
import Screens from "../constants/screens"
import { useTheme } from "../providers/theme/ThemeContext"
import { Record } from "../types/DBTypes"
import Spacer from "./Spacer"

type PictureRowItemProps = {
    showCheckBox: boolean;
    record: Record;
    isChecked: boolean;
    onToggle: () => void;
}

export const PictureRowItem = ({ showCheckBox, record, isChecked, onToggle }: PictureRowItemProps) => {
    const theme = useTheme();
    const navigation = useNavigation<any>();

    const handleTouchOnPress = () => {
        if (showCheckBox) {
            onToggle();
        } else {
            navigation.navigate(Screens.INFO, { record })
        }
    }

    return (
        <TouchableOpacity onPress={handleTouchOnPress}>
            <View style={{
                flexDirection: "row",
                padding: 12,
                borderBottomWidth: 1,
                borderColor: theme.softText
            }}>
                {showCheckBox && (
                    <View style={{ justifyContent: 'center', marginLeft: 'auto', paddingRight: 12 }}>
                        <CheckBox
                            value={isChecked}
                            disabled={true}
                            tintColors={{ true: theme.primary, false: theme.softText }}
                        />
                    </View>
                )}
                <Image
                    source={{ uri: record.fileUri }}
                    style={{
                        width: '25%',
                        aspectRatio: 1,
                        borderRadius: 8,
                        backgroundColor: 'black',
                        alignSelf: 'center'
                    }}
                    resizeMode="contain"
                />
                <View style={{ padding: 8 }}>
                    <Text style={[theme.typography.boldBody, { color: theme.text }]}>{record.name}</Text>
                    <Spacer height={4} />
                    <Text style={[theme.typography.softBody, { color: theme.text }]}>{record.timestamp}</Text>
                    <Spacer height={4} />
                    <Text style={[theme.typography.body, { color: theme.text }]}>Probability: {Math.round(record.probability)} ± {Math.round(record.uncertainity)}%</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

type SortFilterCardProps = {
    closingFunction: () => void;
    selectedItem: number;
    setSelectedItem: (id: number) => void;
}

export const SortFilterCard = ({ closingFunction, selectedItem, setSelectedItem }: SortFilterCardProps) => {
    const theme = useTheme();

    const setIdAndSort = (id: number) => {
        setSelectedItem(id);
        closingFunction();
    }

    return (
        <View style={{
            marginVertical: 16,
            padding: 16,
            backgroundColor: theme.card || "#fff",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 2,
            alignItems: "center",
            width: "90%",
            height: "100%"
        }}>
            <View style={{ flexDirection: "row", justifyContent: "center", width: "100%", marginBottom: 8, alignItems: "center" }}>
                <Text style={[theme.typography.body, { color: theme.softText }]}>
                    Choose Sort Order
                </Text>
                <TouchableOpacity onPress={closingFunction} style={{ position: "absolute", right: 0 }}>
                    <Text style={[theme.typography.body, { color: theme.softText }]}>X</Text>
                </TouchableOpacity>
            </View>
            <Spacer height={32} />
            <View style={{ flexDirection: "column" }}>
                <TouchableOpacity onPress={() => setIdAndSort(0)}>
                    <Text style={selectedItem === 0 ? theme.typography.boldBody : theme.typography.body}>Date (Descending)</Text>
                </TouchableOpacity>
                <Spacer height={16} />
                <TouchableOpacity onPress={() => setIdAndSort(1)}>
                    <Text style={selectedItem === 1 ? theme.typography.boldBody : theme.typography.body}>Date (Ascending)</Text>
                </TouchableOpacity>
                <Spacer height={16} />
                <TouchableOpacity onPress={() => setIdAndSort(2)}>
                    <Text style={selectedItem === 2 ? theme.typography.boldBody : theme.typography.body}>Name (Ascending)</Text>
                </TouchableOpacity>
                <Spacer height={16} />
                <TouchableOpacity onPress={() => setIdAndSort(3)}>
                    <Text style={selectedItem === 3 ? theme.typography.boldBody : theme.typography.body}>Name (Descending)</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}