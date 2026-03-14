import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' | 'guest'
    const [loading, setLoading] = useState(true);

    // Mock Login for easier testing
    const login = async (email, password) => {
        // Faking a successful login request for ANY email for testing purposes
        setLoading(true);
        setTimeout(() => {
            setCurrentUser({ uid: 'mock-user-id', email: email });
            setUserRole('admin'); // Giving admin rights to everyone for testing
            setLoading(false);
        }, 500);
        return Promise.resolve();
    };

    const logout = () => {
        setCurrentUser(null);
        setUserRole(null);
        return Promise.resolve();
    };

    // Skip actual Firebase Auth check for testing
    useEffect(() => {
        setLoading(false);
    }, []);

    const value = {
        currentUser,
        userRole,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
