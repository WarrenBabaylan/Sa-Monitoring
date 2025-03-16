"use client";
import axios from "axios";
import { useState, useEffect } from "react";

const url = process.env.NEXT_PUBLIC_BACKEND_URL + "login.php";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(url, {
                    params: { json: JSON.stringify({}), operation: "checkSession" },
                    withCredentials: true,
                });

                if (response.data.status === "success") {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    return { user, isLoading, setIsLoading };
};
