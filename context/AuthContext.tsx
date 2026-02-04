"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface User {
    id: string;
    nome: string;
    codigo: string;
    isMaster: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (codigo: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem("crm_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (codigo: string) => {
        try {
            const q = query(collection(db, "vendedores"), where("codigo", "==", codigo));
            const res = await getDocs(q);

            if (!res.empty) {
                const userData = { id: res.docs[0].id, ...res.docs[0].data() } as User;
                setUser(userData);
                localStorage.setItem("crm_user", JSON.stringify(userData));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("crm_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
