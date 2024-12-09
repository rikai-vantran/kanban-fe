"use client";
import http from "@/lib/http";
import * as React from "react";
import { accessToken, refreshToken } from "@/lib/http";

export interface AuthProviderProps {
    children: React.ReactNode;
    access?: string;
    refresh?: string;
}

import { createContext, useContext } from "react";

export interface AuthContextValue {
    signIn: (username: string, password: string) => Promise<void>;
    signUp: (username: string, email: string, password: string) => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
    children,
    access,
    refresh
}) => {
    React.useState(() => {
        if (access && refresh) {
            accessToken.value = access
            refreshToken.value = refresh
        }
    })

    return (
        <AuthContext.Provider
            value={{
                signIn: async (username: string, password: string) => {
                    const rs = await http.post<{
                        access: string;
                        refresh: string;
                    }>('/auth/login/', { username, password })
                    await fetch(`${process.env.NEXT_PUBLIC_NEXTSERVER_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            access: rs.payload.access,
                            refresh: rs.payload.refresh,
                        }),
                    });
                    accessToken.value = rs.payload.access
                    refreshToken.value = rs.payload.refresh
                },
                signUp: async (
                    username: string,
                    email: string,
                    password: string
                ) => {
                    http.post<{
                        message: string;
                        data: {
                            email: string;
                            username: string;
                        }
                    }>('/auth/register/', { username, password, email })
                },
                signOut: async () => {
                    // Implement sign out logic
                    accessToken.value = "";
                    refreshToken.value = "";
                    fetch(`${process.env.NEXT_PUBLIC_NEXTSERVER_URL}/api/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
}