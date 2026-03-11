import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, portal = 'user' }) {
    const storageKey = `jokifast-theme-${portal}`;

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem(storageKey) || 'dark';
    });

    useEffect(() => {
        localStorage.setItem(storageKey, theme);
    }, [theme, storageKey]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const isDark = theme === 'dark';

    // Portal determines accent: user=blue, worker=green
    const accent = portal === 'worker' ? 'emerald' : 'blue';

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, portal, accent }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
