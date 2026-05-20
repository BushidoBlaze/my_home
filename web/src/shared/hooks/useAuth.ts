import {useState} from 'react';

export function useAuth() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [fullName, setFullName] = useState<string | null>(localStorage.getItem('fullName'));

    function saveAuth(token: string, role: string, fullName: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('fullName', fullName);
        setToken(token);
        setRole(role);
        setFullName(fullName);
    }

    function logout() {
        localStorage.clear();
        setToken(null);
        setRole(null);
        setFullName(null);
    }

    return {token, role, fullName, saveAuth, logout, isLoggedIn: !!token};
}