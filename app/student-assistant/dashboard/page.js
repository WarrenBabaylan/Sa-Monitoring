"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/components/logout";
import { Container, Table, Spinner, Card, Row, Col } from "react-bootstrap";
import axios from "axios";
import SaNavbar from "@/components/student/navbar";
import { useAuth } from "@/components/useAuth";


const Dashboard = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const { user, isLoading } = useAuth();
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

        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "studentAssistant.php";

        const jsonData = {
            saId: user?.user_id,
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(jsonData),
                    operation: "displaySaDutySchedule",
                },
            });
            console.log(response.data);
            if (Array.isArray(response.data)) {
                setGetSaDutySchedule(response.data);
            } else {
                setGetSaDutySchedule([]);
            }
        } catch (error) {
            setGetSaDutySchedule([]);
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
                    <Row className="mb-4">
                        <Col md={4}>
                            <Card className="stats-card shadow p-3 mb-4 bg-light rounded border">
                                <h4 className="text-primary">Schedule</h4>
                                <h6 className="text-dark">
                                    {getSaDutySchedule.length > 0
                                        ? getSaDutySchedule.map((s) => s.day_names).join(", ")
                                        : "No Schedule"}
                                </h6>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="stats-card shadow p-3 mb-4 bg-light rounded border">
                                <h4 className="text-primary">Time Schedule</h4>
                                <h6 className="text-dark">
                                    {getSaDutySchedule.length > 0
                                        ? (() => {
                                            const schedules = [...new Set(getSaDutySchedule.map(s => {
                                                return s.time_start && s.time_end
                                                    ? `${s.time_start} - ${s.time_end}`
                                                    : "No time schedule";
                                            }))];

                                            return schedules.includes("No time schedule")
                                                ? "No time schedule"
                                                : schedules.join(", ");
                                        })()
                                        : "No time schedule"
                                    }
                                </h6>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="stats-card shadow p-3 mb-4 bg-light rounded border">
                                <h4 className="text-primary">Required Duty Hours</h4>
                                <h6 className="text-dark">
                                    {getSaDutySchedule.length > 0
                                        ? (() => {
                                            let totalMinutes = 0;
                                            let requiredDutyHours = new Set();

                                            getSaDutySchedule.forEach(s => {
                                                if (s.total_duty_hours_formatted) {
                                                    const match = s.total_duty_hours_formatted.match(/(\d+)\s*hours?,?\s*(\d*)\s*minutes?/);
                                                    if (match) {
                                                        const hours = parseInt(match[1], 10) || 0;
                                                        const minutes = parseInt(match[2], 10) || 0;
                                                        totalMinutes += hours * 60 + minutes;
                                                    }
                                                }
                                                if (s.required_duty_hours) {
                                                    requiredDutyHours.add(s.required_duty_hours);
                                                }
                                            });

                                            // Convert total minutes back to hours and minutes
                                            const totalHours = Math.floor(totalMinutes / 60);
                                            const remainingMinutes = totalMinutes % 60;

                                            const formattedTotalDuty =
                                                totalMinutes > 0
                                                    ? `${totalHours > 0 ? `${totalHours} hours` : ""}${totalHours > 0 && remainingMinutes > 0 ? ", " : ""}${remainingMinutes > 0 ? `${remainingMinutes} minutes` : ""}`
                                                    : ""; // If no total duty hours, it will be empty

                                            const formattedRequiredDuty = requiredDutyHours.size > 0 ? [...requiredDutyHours][0] : "";

                                            // If both values are empty, show "No duty hours"
                                            return formattedTotalDuty || formattedRequiredDuty
                                                ? `${formattedTotalDuty || "0 hours"} / ${formattedRequiredDuty || "0 hours"}`
                                                : "No duty hours";
                                        })()
                                        : "No duty hours"}
                                </h6>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default Dashboard;
