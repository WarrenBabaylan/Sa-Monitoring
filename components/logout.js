"use client";
import { useRouter } from "next/navigation";
import axios from "axios";

const url = process.env.NEXT_PUBLIC_BACKEND_URL + "login.php";

export const useLogout = () => {
    const router = useRouter();

    const logout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        try {
            const response = await axios.get(url, {
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
            alert("An error occurred during logout.");
        }
    };

    return logout;
};
