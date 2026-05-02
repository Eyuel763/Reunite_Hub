import { LogIn } from "lucide-react";
import { createContext, useState, useEffect, Children } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ loggedIn: true});
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        setUser({ loggedIn: true });
    };

    const logout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}