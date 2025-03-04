"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/components/logout";
import { Container, Table, Spinner } from "react-bootstrap";
import axios from "axios";
import SaNavbar from "@/components/student/navbar";
import { useAuth } from "@/components/useAuth";


const Dashboard = () => {
    const { user, isLoading, setIsLoading } = useAuth();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const router = useRouter();
    const logout = useLogout();

    const [getSaDutySchedule, setGetSaDutySchedule] = useState([]);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "student-assistant")) {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            retrieveSaDutySchedule();
        }
    }, [user]);

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

    const retrieveSaDutySchedule = async () => {
        if (!user) return;

        const url =
            "http://localhost/nextjs/api/sa-monitoring/studentAssistant.php";

        const jsonData = {
            saId: user.user_id,
        };

        console.log(jsonData);

        const response = await axios.get(url, {
            params: {
                json: JSON.stringify(jsonData),
                operation: "displaySaDutySchedule",
            },
        });
        setGetSaDutySchedule(response.data);
        console.log(response.data);
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
            <SaNavbar
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

                    <h1>Dashboard</h1>

                    <Table>
                        <thead>
                            <tr>
                                <td>Day Schedule</td>
                                <td>Time Schedule</td>
                                <td>Total Duty Hours</td>
                                <td>Rendered Duty Hours</td>
                                <td>Required Duty Hours</td>
                            </tr>
                        </thead>
                        <tbody>
                            {getSaDutySchedule.map((saDutySchedule, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{saDutySchedule.day_names}</td>
                                        <td>{saDutySchedule.time_schedule}</td>
                                        <td>{saDutySchedule.total_duty_hours_formatted}</td>
                                        <td>{saDutySchedule.rendered_vs_required}</td>
                                        <td>{saDutySchedule.required_duty_hours}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Container>
            </div>
        </>
    );
};

export default Dashboard;
