import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const themeColor = '#2D5F4C'; // Forest green default

    return (
        <ThemeContext.Provider value={{ themeColor }}>
            {children}
        </ThemeContext.Provider>
    );
};
