"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { useLogout } from "@/components/logout";
import { useAuth } from "@/components/useAuth";
import {
    Container,
    Spinner,
    Card,
    Row,
    Col,
    Modal,
    Button,
    Tooltip as BootstrapTooltip,
    OverlayTrigger,
} from "react-bootstrap";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const Dashboard = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const { user, isLoading, setIsLoading } = useAuth();
    const router = useRouter();
    const logout = useLogout();

    const [getSAList, setGetSAList] = useState([]);
    const [getAdminList, setGetAdminList] = useState([]);
    const [attendanceData, setAttendanceData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [totalSA, setTotalSA] = useState(0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "admin")) {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        retrieveSAList();
        retrieveAdminList();
        retrieveAttendancePie();
    }, [selectedDate]);

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

    const retrieveSAList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "admin.php";

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: "displayTotalSA",
                },
            });
            if (Array.isArray(response.data.students) && response.data.count) {
                setGetSAList(response.data.students);
                setTotalSA(response.data.count);
            } else {
                setGetSAList([]);
                setTotalSA(0);
            }
        } catch (error) {
            setGetSAList([]);
            setTotalSA(0);
        }
    };

    const retrieveAdminList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "admin.php";

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: "displayTotalAdmin",
                },
            });
            if (Array.isArray(response.data) && response.data.length > 0) {
                setGetAdminList(response.data[0].admin);
            } else {
                setGetAdminList(0);
            }
        } catch (error) {
            setGetAdminList(0);
        }
    };

    const getWeekRange = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1); // Set to Monday
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 6); // Set to Sunday
        end.setHours(23, 59, 59, 999);

        return { start, end };
    };

    const retrieveAttendancePie = async () => {
        const { start, end } = getWeekRange(selectedDate);

        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "admin.php";

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        start_date: start.toISOString().split("T")[0],
                        end_date: end.toISOString().split("T")[0],
                    }),
                    operation: "displayAttedancePie",
                },
            });

            if (Array.isArray(response.data) && response.data.length > 0) {
                const { total_present, total_late, total_absent } = response.data[0];
                const pieData = {
                    labels: ["Present", "Late", "Absent"],
                    datasets: [
                        {
                            data: [total_present, total_late, total_absent],
                            backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
                        },
                    ],
                };
                setAttendanceData(pieData);
            } else {
                setAttendanceData(null);
            }
        } catch (error) {
            setAttendanceData(null);
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
                    <Row className="mt-1 g-3">
                        <Col xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                            <Card className="text-white shadow w-100" style={{ backgroundColor: "#2b59ff" }}>
                                <Card.Body className="text-center p-4">
                                    <Card.Title>Total Admin</Card.Title>
                                    <h1 className="fw-bold">{getAdminList}</h1>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                            <Card
                                className="text-white shadow w-100"
                                style={{ backgroundColor: "#2b59ff", cursor: "pointer" }}
                                onClick={() => setShowModal(true)}
                            >
                                <Card.Body className="text-center p-4">
                                    <Card.Title>Total Student Assistant</Card.Title>
                                    <h1 className="fw-bold">{totalSA}</h1>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="mt-4">
                        <Col>
                            <h6 className="fw-bold">Select a Week:</h6>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="yyyy-MM-dd"
                                showWeekNumbers
                                className="form-control"
                            />
                        </Col>
                    </Row>

                    <Row className="mt-2 g-3 justify-content-start">
                        <Col xs={12} sm={6} md={4} className="d-flex justify-content-start">
                            <Card className="shadow w-100" style={{ maxWidth: "280px" }}>
                                <Card.Body className="text-center p-3">
                                    <Card.Title>Weekly Attendance</Card.Title>
                                    {attendanceData ? (
                                        <div style={{ width: "100%", minHeight: "220px", display: "flex", justifyContent: "center" }}>
                                            <Pie
                                                data={attendanceData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <p>Loading chart...</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Student Assistant List</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {getSAList.length > 0 ? (
                        <div>
                            {getSAList.map((sa) => (
                                <div key={sa.sa_id} style={{ marginBottom: "5px" }}>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <BootstrapTooltip id={`tooltip-${sa.sa_id}`}>
                                                {sa.total_duty_hours_formatted} / {sa.required_duty_hours}
                                            </BootstrapTooltip>
                                        }
                                    >
                                        <span style={{ cursor: "pointer", display: "inline-block" }}>
                                            {sa.sa_fullname}
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No student assistants found.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Dashboard;
