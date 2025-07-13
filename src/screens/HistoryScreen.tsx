import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Easing, FlatList, View } from "react-native";
import CameraIcon from "../assets/icons/camera.svg";
import CheckIcon from "../assets/icons/check.svg";
import FilterIcon from "../assets/icons/filter.svg";
import { FloatingActionButton, IconButton, OutlineButton, TextButton } from "../components/Buttons";
import { Title } from "../components/Fonts";
import { SearchInput } from "../components/Inputs";
import Spacer from "../components/Spacer";
import { PictureRowItem, SortFilterCard } from "../components/Special";
import Colors from "../constants/colors";
import Screens from "../constants/screens";
import { useTheme } from "../providers/theme/ThemeContext";
import { Record } from "../types/DBTypes";
import { DatabaseHandler } from "../utils/dbHandler";


const HistoryScreen = () => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [records, setRecords] = useState<Record[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // const [isSort, setIsSort] = useState<boolean>(false);
    const [isSelection, setIsSelection] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [sortField, setSortField] = useState<number>(0);
    const databaseHandler = DatabaseHandler.getInstance();
    const navigation = useNavigation<any>();
    const [isSort, setIsSort] = useState<boolean>(false); // Keep for toggle logic
    const sortAnim = useRef(new Animated.Value(0)).current; // 0: hidden, 1: visible
    console.log("Loading History Page");

    // Helper to parse custom timestamp format to Date
    const parseTimestamp = (timestamp?: string): Date => {
        // If timestamp is undefined or empty, return minimal date
        if (!timestamp) return new Date(0);
        // Try to parse ISO or fallback to Date.parse
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) return date;
        // If parsing failed, fallback to epoch
        return new Date(0);
    }

    // Sort records by sortField (0: date desc, 1: date asc, 2: name asc, 3: name desc)
    const sortRecordsBySortField = () => {
        setRecords(prevRecords => {
            const sorted = [...prevRecords];
            if (sortField === 0) {
                // Date Descending (newest first)
                sorted.sort((a, b) => parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime());
            } else if (sortField === 1) {
                // Date Ascending (oldest first)
                sorted.sort((a, b) => parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime());
            } else if (sortField === 2) {
                // Name Ascending (A-Z)
                sorted.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortField === 3) {
                // Name Descending (Z-A)
                sorted.sort((a, b) => b.name.localeCompare(a.name));
            }

            return sorted;
        });
    }

    const fetchRecordsToDisplay = async () => {
        let fetchedRecords = await databaseHandler.getAllRecords();
        if (fetchedRecords === null) {
            console.log("Error fetching records from SQLite DB in History Page");
        } else {
            console.log("Fetched records", fetchedRecords)
            setRecords(fetchedRecords);
            setIsLoading(false)
            sortRecordsBySortField(); // Sort after fetching
        }
    }


    const navigateBackOnPress = () => {
        navigation.replace(Screens.CAMERA);
    }

    const handleSelectionOnPress = () => {
        setIsSort(false);

        if (records.length === 0) {
            Alert.alert("No records present to select!");
            return;
        }
        setIsSelection(prevValue => !prevValue)
    }

    const handleSortCardOnPress = () => {
        setIsSelection(false);
        setIsSort(prev => !prev);
    }

    const handleCancelSelectionOnPress = () => {
        setIsSelection(false)
    }

    const handleSelectAllOnPress = () => {
        const allIds = new Set(records.map(record => record.id!));
        setSelectedIds(allIds);
    }

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            console.log("Previous set of selected items: ", prev);
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                console.log("Deleting ", id);
                newSet.delete(id);
            } else {
                console.log("Adding ", id);
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleDeleteSelectionOnPress = () => {
        const idsToDelete = Array.from(selectedIds);
        if (idsToDelete.length === 0) {
            Alert.alert("No records selected to delete!");
            return;
        }

        Alert.alert(
            "Confirm Deletion",
            "Deleting removes all data about \nthe image and requires re-running \nof inference with the same image.\n\nProceed with Deletion?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        console.log("IDs selected for deletion: ", idsToDelete);
                        idsToDelete.forEach(id => databaseHandler.deleteRecord(id));
                        setSelectedIds(new Set());
                        setIsSelection(false);
                        fetchRecordsToDisplay(); // refresh list
                    }
                }
            ]
        );
    }

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true)
            fetchRecordsToDisplay();
        }, [])
    );

    // Animate sort card in/out when isSort changes
    useEffect(() => {
        if (isSort) {
            Animated.timing(sortAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }).start();
        } else {
            Animated.timing(sortAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.in(Easing.cubic),
            }).start();
        }
    }, [isSort, sortAnim]);

    // Re-sort whenever the sortField changes
    useEffect(() => {
        sortRecordsBySortField();
    }, [sortField]);

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 12, paddingRight: 12 }}>
                <Title>Photo History</Title>
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "25%" }}>
                    <IconButton onPress={handleSelectionOnPress}><CheckIcon height={28} width={28} stroke={theme.text} /></IconButton>
                    <IconButton onPress={handleSortCardOnPress}><FilterIcon height={28} width={28} stroke={theme.text} /></IconButton>
                </View>
            </View>
            <Spacer height={24} />
            <SearchInput onChangeText={setSearchQuery} value={searchQuery} />
            {isSelection && (
                <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 8 }}>
                    <TextButton onPress={handleSelectAllOnPress} color={Colors.PRIMARY}>Select All</TextButton>
                </View>
            )
            }

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.text} />
                </View>
            ) : (
                <FlatList
                    data={records}
                    keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
                    renderItem={({ item }) => (
                        <PictureRowItem
                            showCheckBox={isSelection}
                            record={item}
                            isChecked={selectedIds.has(item.id!)}
                            onToggle={() => toggleSelection(item.id!)}
                        />
                    )}
                />
            )}
            {/* Animated Sort Card */}
            <Animated.View
                pointerEvents={isSort ? "auto" : "none"}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    // Slide up from bottom: translateY from 300 to 0
                    transform: [{
                        translateY: sortAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [300, 0],
                        })
                    }],
                    opacity: sortAnim,
                    zIndex: 10,
                    // Center horizontally
                    alignItems: "center",
                }}
            >
                <SortFilterCard
                    closingFunction={() => setIsSort(false)}
                    selectedItem={sortField}
                    setSelectedItem={setSortField}
                />
            </Animated.View>

            {!isSelection && <FloatingActionButton onPress={navigateBackOnPress}><CameraIcon height={36} width={36} stroke={theme.text} /></FloatingActionButton>}


            {isSelection && (
                <View style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <OutlineButton style={{ width: "45%" }} color={Colors.OKAY} onPress={handleCancelSelectionOnPress}>Cancel</OutlineButton>
                    <OutlineButton style={{ width: "45%" }} color={Colors.WARN} onPress={handleDeleteSelectionOnPress}>Delete</OutlineButton>
                </View>
            )}
        </View>
    )
}

export default HistoryScreen;