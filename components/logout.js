"use client";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = "http://localhost/nextjs/api/loginAuth/admin.php";

export const useLogout = () => {
    const router = useRouter();

    const logout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        try {
            const response = await axios.get(API_URL, {
                params: { json: JSON.stringify({}), operation: "logout" },
                withCredentials: true,
            });

            if (response.data.status === "success") {
                sessionStorage.clear();
                router.push("/");
            } else {
                alert("Logout failed. Please try again.");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert("An error occurred during logout.");
        }
    };

    return logout;
};
