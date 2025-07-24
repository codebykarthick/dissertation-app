

import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { Search as SearchIcon } from 'react-native-feather';
import { useTheme } from '../providers/theme/ThemeContext';

type SearchInputProps = TextInputProps & {
    placeholder?: string;
};

export const SearchInput = ({ placeholder = 'Search', ...props }: SearchInputProps) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.card }]}>
            <SearchIcon width={20} height={20} stroke={theme.text} />
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={theme.text + '99'}
                style={[styles.input, { color: theme.text }]}
                {...props}
            />
        </View>
    );
};

export const Input = ({ placeholder = 'Name of file', value, onChangeText, ...props }: SearchInputProps) => {
    const theme = useTheme();

    const clearInput = () => {
        onChangeText?.('');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.card }]}>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={theme.text + '99'}
                style={[styles.input, { color: theme.text }]}
                value={value}
                onChangeText={onChangeText}
                {...props}
            />
            {!!value && (
                <TouchableOpacity onPress={clearInput} style={{ marginLeft: 8 }}>
                    <Text style={{ color: theme.text, fontSize: 18 }}>×</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        marginVertical: 8,
    },
    input: {
        marginLeft: 10,
        flex: 1,
        fontSize: 16,
    },
});