"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/components/logout";
import { Container, Table, Button, Spinner, Card, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios";
import SaNavbar from "@/components/student/navbar";
import { useAuth } from "@/components/useAuth";


const TrackTime = () => {
    const { user, isLoading } = useAuth();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const router = useRouter();
    const logout = useLogout();

    const [hasSchedule, setHasSchedule] = useState(false);
    const [isOnLeave, setIsOnLeave] = useState(false);
    const [scheduleId, setScheduleId] = useState(null);

    const [getSaDutySchedule, setGetSaDutySchedule] = useState([]);
    const [getSaTimeIn, setGetSaTimeIn] = useState([]);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "student-assistant")) {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            retrieveSaDutySchedule();
            retrieveSaTimeIn();
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

    const [toast, setToast] = useState({
        show: false,
        variant: "success",
        message: "",
    });

    const showToast = (variant, message) => {
        setToast({ show: true, variant, message });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 1000);
    };

    const retrieveSaDutySchedule = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "studentAssistant.php";

        const jsonData = {
            saId: user.user_id,
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(jsonData),
                    operation: "displaySaDutySchedule",
                },
            });

            setGetSaDutySchedule(response.data);
            const today = new Date().toLocaleString("en-us", { weekday: "long" });
            const scheduleToday = response.data.some((schedule) =>
                schedule.day_names.includes(today)
            );

            const onLeaveToday = response.data.some((schedule) =>
                schedule.day_names.includes(`${today} - On Leave`)
            );

            setHasSchedule(scheduleToday);
            setIsOnLeave(onLeaveToday);

            if (scheduleToday && !onLeaveToday) {
                const schedule = response.data.find((schedule) =>
                    schedule.day_names.includes(today)
                );
                setScheduleId(schedule.duty_schedule_id);
            }
        } catch (error) {
            setGetSaDutySchedule([]);
        }
    };

    const retrieveSaTimeIn = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "studentAssistant.php";

        const jsonData = {
            saId: user.user_id,
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(jsonData),
                    operation: "displaySaTimeInTrack",
                },
            });
            setGetSaTimeIn(response.data);
            console.log(response.data);
        } catch (error) {
            setGetSaTimeIn([]);
        }
    };

    const SaTimeIn = async () => {
        if (!hasSchedule) {
            showToast("warning", "No Schedule Today\nYou don't have a schedule today, so you cannot time in.");
            return;
        }

        const confirmTimeIn = confirm("Are you sure you want to time in?");
        if (!confirmTimeIn) return;

        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "studentAssistant.php";

        const jsonData = {
            saId: user.user_id,
            dutyScheduleId: scheduleId, // Pass the selected schedule ID
        };

        const formData = new FormData();
        formData.append("operation", "SaTimeIn");
        formData.append("json", JSON.stringify(jsonData));

        try {
            const response = await axios({
                url: url,
                method: "POST",
                data: formData,
            });

            if (response.data.success) {
                showToast("success", response.data.message);
                retrieveSaTimeIn();
            } else {
                showToast("warning", response.data.message);
            }
        } catch (error) {
            showToast("danger", "Network error. Please try again.");
        }
    };

    const SaTimeOut = async () => {
        if (!hasSchedule) {
            showToast("warning", "No Schedule Today\nYou don't have a schedule today, so you cannot time out.");
            return;
        }

        if (getSaTimeIn.length === 0) {
            setErrorMessage("You haven't timed in yet.");
            return;
        }

        // const lastEntry = getSaTimeIn[getSaTimeIn.length - 1];
        const lastEntry = getSaTimeIn[0];
        const trackId = lastEntry.track_id; // Get track_id from API response

        if (!trackId) {
            showToast("danger", "Invalid tracking ID. Please try again.");
            return;
        }

        const confirmTimeOut = confirm("Are you sure you want to time out?");
        if (!confirmTimeOut) return;

        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "studentAssistant.php";

        const jsonData = {
            saId: user.user_id,
            dutyScheduleId: scheduleId,
            trackId: trackId, // Include trackId
        };

        console.log(jsonData);

        const formData = new FormData();
        formData.append("operation", "SaTimeOut");
        formData.append("json", JSON.stringify(jsonData));

        try {
            const response = await axios({
                url: url,
                method: "POST",
                data: formData,
            });

            if (response.data.success) {
                showToast("success", response.data.message);
                retrieveSaTimeIn();
            } else {
                showToast("warning", response.data.message);
            }
        } catch (error) {
            showToast("danger", "Network error. Please try again.");
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

                    <Button
                        variant="success"
                        className="fw-bold px-4 py-2 me-3 rounded-pill shadow mb-2"
                        onClick={SaTimeIn}
                        disabled={!hasSchedule || isOnLeave}
                    >
                        {isOnLeave ? "On Leave" : hasSchedule ? "Time In" : "No Schedule Today"}
                    </Button>

                    <Button
                        variant="danger"
                        className="fw-bold px-4 py-2 rounded-pill shadow mb-2"
                        onClick={SaTimeOut}
                        disabled={!hasSchedule || isOnLeave}
                    >
                        {isOnLeave ? "On Leave" : hasSchedule ? "Time Out" : "No Schedule Today"}
                    </Button>

                    <Card className="shadow rounded-3 mt-3">
                        <Card.Header className="bg-primary text-white">
                            <h5>Track Time</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table
                                responsive
                                striped
                                bordered
                                hover
                                className="mb-0 text-center mt-4"
                                style={{ borderRadius: "8px", overflow: "hidden" }}
                            >
                                <thead className="bg-dark text-white">
                                    <tr>
                                        <th>Date</th>
                                        <th>Day</th>
                                        <th>Time Schedule</th>
                                        <th>Time In</th>
                                        <th>Time Out</th>
                                        <th>Approved Status</th>
                                        <th>Status</th>
                                        <th>Approved By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center text-muted">
                                                Loading data, please wait...
                                            </td>
                                        </tr>
                                    ) : !Array.isArray(getSaTimeIn) ? (
                                        <tr>
                                            <td colSpan="8" className="text-center text-danger fw-bold">
                                                No data available. Please wait or check your connection.
                                            </td>
                                        </tr>
                                    ) : getSaTimeIn.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center text-muted">
                                                No time in available.
                                            </td>
                                        </tr>
                                    ) : (
                                        getSaTimeIn.map((timeIn, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{timeIn.formatted_date}</td>
                                                <td className="text-center">{timeIn.day_name}</td>
                                                <td className="text-center">{timeIn.time_start} - {timeIn.time_end}</td>
                                                <td className="text-center text-success fw-bold">
                                                    {timeIn.time_in}
                                                </td>
                                                <td className="text-center text-danger fw-bold">
                                                    {timeIn.time_out}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${timeIn.approved_status_name === "Approved"
                                                            ? "bg-success"
                                                            : timeIn.approved_status_name === "Pending"
                                                                ? "bg-warning text-dark"
                                                                : "bg-danger"
                                                            }`}
                                                    >
                                                        {timeIn.approved_status_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${timeIn.status_name === "Present"
                                                            ? "bg-success"
                                                            : timeIn.status_name === "Late"
                                                                ? "bg-danger"
                                                                : "bg-secondary"
                                                            }`}
                                                    >
                                                        {timeIn.status_name}
                                                    </span>
                                                </td>
                                                <td className="text-center text-secondary">
                                                    <em>{timeIn.admin_fullname}</em>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Container>
            </div>

            <ToastContainer position="top-end" className="p-3">
                <Toast
                    show={toast.show}
                    onClose={() => setToast({ ...toast, show: false })}
                    delay={1000}
                    autohide
                    bg={toast.variant}
                >
                    <Toast.Body className="text-white">{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default TrackTime;
