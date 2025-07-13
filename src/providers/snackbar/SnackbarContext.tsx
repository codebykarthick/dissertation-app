import React, { createContext, useCallback, useContext, useState } from 'react';
import Snackbar from '../../components/Snackbar';
import Colors from '../../constants/colors';

type SnackbarContextType = {
    showSnackbar: (message: string, color: string, duration?: number) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) throw new Error('useSnackbar must be used within a SnackbarProvider');
    return context;
};

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [color, setColor] = useState(Colors.PRIMARY);
    const [message, setMessage] = useState('');

    const showSnackbar = useCallback((msg: string, color: string, duration = 3000) => {
        setMessage(msg);
        setColor(color);
        setVisible(true);
        setTimeout(() => setVisible(false), duration);
    }, []);

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            {visible && (
                <Snackbar message={message} color={color} />
            )}
        </SnackbarContext.Provider>
    );
};