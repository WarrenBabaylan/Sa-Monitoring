"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/components/logout";
import { Container, Table, Spinner, Card, Row, Col } from "react-bootstrap";
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

                    <Card className="shadow p-3 mb-4 bg-white rounded">
                        <Card.Body>
                            <h1 className="text-primary text-center">Dashboard</h1>
                        </Card.Body>
                    </Card>

                    <Row className="mb-4">
                        <Col md={4}>
                            <Card className="stats-card shadow p-3 mb-4 bg-white rounded">
                                <h2>Schedule</h2>
                                <h6>
                                    {getSaDutySchedule.length > 0
                                        ? getSaDutySchedule.map((s) => s.day_names).join(", ")
                                        : "No Schedule"}
                                </h6>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="stats-card shadow p-3 mb-4 bg-white rounded">
                                <h2>Time Schedule</h2>
                                <h6>
                                    {getSaDutySchedule.length > 0
                                        ? getSaDutySchedule.map((s) => s.time_schedule).join(", ")
                                        : "No time schedule"}
                                </h6>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="stats-card shadow p-3 mb-4 bg-white rounded">
                                <h2>Required Duty Hours</h2>
                                <h6>
                                    {getSaDutySchedule
                                        .map((s) => {
                                            const totalDuty = s.total_duty_hours_formatted;
                                            const requiredDuty = s.required_duty_hours;
                                            if (totalDuty === "No duty hours" && requiredDuty === "No duty hours") {
                                                return "No duty hours";
                                            }

                                            return `${totalDuty} / ${requiredDuty}`;
                                        })
                                        .join(", ")}
                                </h6>
                            </Card>
                        </Col>
                    </Row>

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
