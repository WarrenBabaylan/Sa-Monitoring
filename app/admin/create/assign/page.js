"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";
import {
    Container,
    Button,
    Modal,
    Card,
    Badge,
    Spinner,
    Form,
    Row,
    Col
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import FormField from "@/components/form";

const AssignSchedule = () => {
    const { user, isLoading, setIsLoading } = useAuth();
    const searchParams = useSearchParams();
    const saId = searchParams.get("saId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const requiredDutyHours = searchParams.get("requiredDutyHours");
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user || user.role !== "admin") {
                setIsLoading(true);
                setTimeout(() => {
                    router.push("/");
                }, 800);
            }
        }
    }, [user, isLoading, router, setIsLoading]);

    const [getDays, setGetDays] = useState([]);
    const [getDutyHours, setGetDutyHours] = useState([]);

    const [days, setDays] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [dutyHours, setDutyHours] = useState("");

    useEffect(() => {
        retrieveDays();
        retrieveDutyHours();
    }, []);

    useEffect(() => {
        if (requiredDutyHours && Array.isArray(getDutyHours)) {
            const matchingOption = getDutyHours.find(
                (hours) => hours.required_duty_hours == requiredDutyHours
            );
            if (matchingOption) {
                setDutyHours(matchingOption.duty_hours_id);
            }
        }
    }, [requiredDutyHours, getDutyHours]);

    useEffect(() => {
        if (start && start !== "null") {
            setStartTime(convertTo24HourFormat(start));
        } else {
            setStartTime("");
        }
    }, [start]);

    useEffect(() => {
        if (end && end !== "null") {
            setEndTime(convertTo24HourFormat(end));
        } else {
            setEndTime("");
        }
    }, [end]);

    const [alertShow, setAlertShow] = useState({
        show: false,
        variant: "success",
        message: "",
    });

    const showAlert = (variant, message) => {
        setAlertShow({ show: true, variant, message });
        setTimeout(() => {
            setAlertShow((prev) => ({ ...prev, show: false }));
        }, 5000);
    };

    const retrieveDays = async () => {
        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: "displayDays",
                },
            });
            setGetDays(response.data);
        } catch (error) {
            setGetDays([]);
        }
    };

    const retrieveDutyHours = async () => {
        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: "displayDutyHours",
                },
            });
            setGetDutyHours(response.data);
        } catch (error) {
            setGetDutyHours(null);
        }
    };

    const handleSelectionDay = (event) => {
        const selectedDay = getDays.find(
            (day) => day.day_id === event.target.value
        );
        if (
            selectedDay &&
            !selectedDays.some((d) => d.day_id === selectedDay.day_id)
        ) {
            setSelectedDays((prev) => [...prev, selectedDay]);
        }
        setDays("");
    };

    const handleStartTimeChange = (event) => {
        setStartTime(event.target.value);
    };

    const handleEndTimeChange = (event) => {
        setEndTime(event.target.value);
    };

    const selectedDutyHours = (event) => {
        setDutyHours(event.target.value);
    };

    const removeDay = (dayId) => {
        setSelectedDays((prev) => prev.filter((day) => day.day_id !== dayId));
    };

    const submitAssignSched = async () => {

        const confirmAssignSchedule = confirm("Are you sure you want to submit?");
        if (!confirmAssignSchedule) return;

        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        const jsonData = {
            saId: saId,
            dayIds: selectedDays.map((day) => day.day_id),
            startTime: convertTo24HourFormat(startTime),
            endTime: convertTo24HourFormat(endTime),
            dutyHours: dutyHours,
            adminId: user.user_id,
        };

        console.log(jsonData);

        const formData = new FormData();
        formData.append("operation", "assignSaDutySchedule");
        formData.append("json", JSON.stringify(jsonData));

        const response = await axios({
            url: url,
            method: "POST",
            data: formData,
        });

        if (response.data == 1) {
            showAlert("success", "Assigned schedule successfully");
            router.push("/admin/create");
            setSelectedDays([]);
            setStartTime("");
            setEndTime("");
            setDutyHours("");
        } else {
            showAlert("warning", "Assigned schedule failed!");
        }
    };

    const convertTo24HourFormat = (time) => {
        const [timePart, modifier] = time.split(" ");
        let [hours, minutes] = timePart.split(":");
        if (modifier === "PM" && hours !== "12") hours = parseInt(hours, 10) + 12;
        if (modifier === "AM" && hours === "12") hours = "00";
        return `${hours}:${minutes}`;
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
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="shadow-lg p-4 rounded-4" style={{ width: "100%", maxWidth: "500px" }}>
                <div className="position-absolute top-0 start-0 p-3">
                    <Icon.ArrowLeft
                        size={30}
                        className="text-primary"
                        style={{ cursor: "pointer" }}
                        onClick={() => router.push("/admin/create")}
                    />
                </div>

                <div className="text-center">
                    <h2 className="fw-bold text-dark mb-3">Assign Schedule</h2>
                </div>

                {alertShow.show && (
                    <Modal
                        show={alertShow.show}
                        onHide={() => setAlertShow({ ...alertShow, show: false })}
                        centered
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Body
                            className="text-center p-4 rounded-4"
                            style={{
                                backgroundColor: "#f0f0f5",
                                boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
                            }}
                        >
                            <h5
                                className={`fw-bold ${alertShow.variant === "danger"
                                    ? "text-danger"
                                    : alertShow.variant === "warning"
                                        ? "text-warning"
                                        : "text-success"
                                    }`}
                            >
                                {alertShow.message}
                            </h5>
                        </Modal.Body>
                    </Modal>
                )}

                <Form>
                    <FormField label="Days" as="select" value={days} onChange={handleSelectionDay}>
                        <option value="">Select Day</option>
                        {!Array.isArray(getDays) || getDays.length === 0 ? (
                            <option disabled>No results.</option>
                        ) : (
                            getDays.map((day, index) => (
                                <option key={index} value={day.day_id}>
                                    {day.day_name}
                                </option>
                            ))
                        )}
                    </FormField>

                    {selectedDays.length > 0 && (
                        <div className="mb-3 d-flex flex-wrap">
                            {selectedDays.map((day) => (
                                <Badge
                                    key={day.day_id}
                                    pill
                                    bg="primary"
                                    className="me-2 mb-2 p-2 d-flex align-items-center"
                                    style={{ cursor: "pointer", fontSize: "14px" }}
                                    onClick={() => removeDay(day.day_id)}
                                >
                                    {day.day_name}
                                    <Icon.X size={14} className="ms-2" />
                                </Badge>
                            ))}
                        </div>
                    )}

                    <Row>
                        <Col>
                            <FormField label="Start Time" type="time" value={startTime} onChange={handleStartTimeChange} />
                        </Col>
                        <Col>
                            <FormField label="End Time" type="time" value={endTime} onChange={handleEndTimeChange} />
                        </Col>
                    </Row>

                    <FormField label="Select Duty Hours" as="select" value={dutyHours} onChange={selectedDutyHours}>
                        <option value="">Select Duty Hours</option>
                        {!Array.isArray(getDutyHours) || getDutyHours.length === 0 ? (
                            <option disabled>No results.</option>
                        ) : (
                            getDutyHours.map((hours, index) => (
                                <option key={index} value={hours.duty_hours_id}>
                                    {hours.required_duty_hours} hours
                                </option>
                            ))
                        )}
                    </FormField>

                    <Button
                        variant="primary"
                        className="mt-4 w-100 rounded-3 fw-bold py-2"
                        onClick={submitAssignSched}
                        disabled={selectedDays.length === 0 || !startTime || !endTime || !dutyHours}
                    >
                        Submit
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default AssignSchedule;