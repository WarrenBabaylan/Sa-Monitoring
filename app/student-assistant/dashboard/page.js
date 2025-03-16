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
                                        ? getSaDutySchedule.map((s) => s.time_schedule).join(", ")
                                        : "No time schedule"}
                                </h6>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="stats-card shadow p-3 mb-4 bg-light rounded border">
                                <h4 className="text-primary">Required Duty Hours</h4>
                                <h6 className="text-dark">
                                    {getSaDutySchedule.length === 0 ? (
                                        "No duty hours"
                                    ) : (
                                        getSaDutySchedule
                                            .map((s) => {
                                                const totalDuty = s.total_duty_hours_formatted;
                                                const requiredDuty = s.required_duty_hours;
                                                return totalDuty === "No duty hours" && requiredDuty === "No duty hours"
                                                    ? "No duty hours"
                                                    : `${totalDuty} / ${requiredDuty}`;
                                            })
                                            .join(", ")
                                    )}
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
