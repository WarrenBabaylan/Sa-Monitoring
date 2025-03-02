"use client";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { useLogout } from "@/components/logout";
import { useAuth } from "@/components/useAuth";
import { Container, Button, Spinner } from "react-bootstrap";
import FormField from "@/components/form";

const DutyHours = () => {
    const { user, isLoading, setIsLoading } = useAuth();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const router = useRouter();
    const logout = useLogout();

    const [hours, setHours] = useState("");

    useEffect(() => {
        if (!isLoading) {
            if (!user || user.role !== "admin") {
                setIsLoading(true);
                setTimeout(() => {
                    router.push("/");
                }, 1000);
            }
        }
    }, [user, isLoading, router, setIsLoading]);

    const handleResize = useCallback(() => {
        setIsSidebarVisible(window.innerWidth >= 768);
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    const toggleSidebar = useCallback(() => {
        setIsSidebarVisible((prev) => !prev);
    }, []);

    const addDutyHours = async () => {
        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        const jsonData = {
            requiedDutyHours: hours,
            adminId: user.user_id,
        };

        console.log(jsonData);

        const formData = new FormData();
        formData.append("operation", "addDutyHours");
        formData.append("json", JSON.stringify(jsonData));

        const response = await axios({
            url: url,
            method: "POST",
            data: formData,
        });

        if (response.data == 1) {
            alert("Add duty hours successfull.");
            setHours("");
        } else {
            alert("Add duty hours failed!");
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <AdminNavbar
                firstname={user.firstname}
                lastname={user.lastname}
                isSidebarVisible={isSidebarVisible}
                toggleSidebar={toggleSidebar}
                logout={logout}
            />

            <div
                style={{
                    display: "flex",
                    height: "100vh",
                    marginLeft: isSidebarVisible ? "250px" : "0",
                    transition: "margin-left 0.3s ease",
                }}
            >
                <Container
                    fluid
                    style={{
                        flex: 1,
                        padding: "20px",
                        overflowY: "auto",
                        marginTop: "56px",
                    }}
                >

                    <h2>Add Duty Hours</h2>

                    <FormField
                        label={"Duty Hours"}
                        type={"number"}
                        placeholder={"enter duty hours"}
                        value={hours}
                        onChange={(e) => {
                            setHours(e.target.value);
                        }}
                    />

                    <Button variant="primary" onClick={addDutyHours} disabled={!hours}>
                        Submit
                    </Button>
                </Container>
            </div>
        </>
    );
};

export default DutyHours;
