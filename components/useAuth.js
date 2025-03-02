"use client";
import axios from "axios";
import { useState, useEffect } from "react";

const API_URL = "http://localhost/nextjs/api/sa-monitoring/login.php";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(API_URL, {
                    params: { json: JSON.stringify({}), operation: "checkSession" },
                    withCredentials: true,
                });

                if (response.data.status === "success") {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error checking session:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    return { user, isLoading, setIsLoading };
};
