"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/components/logout";
import {
    Button,
    Container,
    Form,
    Row,
    Col,
    Modal,
    Table,
    Spinner,
} from "react-bootstrap";
import axios from "axios";
import SaNavbar from "@/components/student/navbar";
import { useAuth } from "@/components/useAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ApplyLeave = () => {
    const { user, isLoading, setIsLoading } = useAuth();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const router = useRouter();
    const logout = useLogout();

    const [leaveType, setLeaveType] = useState("");
    const [customLeaveType, setCustomLeaveType] = useState("");
    const [reason, setReason] = useState("");
    const [date, setDate] = useState(null);

    const [getSaLeaveRequests, setGetSaLeaveRequests] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "student-assistant")) {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            if (selectedDate) {
                retrieveLeaveRequest(user.user_id, selectedDate, setGetSaLeaveRequests);
            }
        }
    }, [user, selectedDate]);

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

    //--------------- Modal ---------------//
    const [showLeaveRequest, setShowLeaveRequest] = useState(false);
    const handleCloseModal = () => setShowLeaveRequest(false);
    const handleShowModal = () => setShowLeaveRequest(true);

    const retrieveLeaveRequest = async () => {
        try {
            const url =
                "http://localhost/nextjs/api/sa-monitoring/studentAssistant.php";

            const formattedDate = selectedDate
                ? `${selectedDate.getFullYear()}-${String(
                    selectedDate.getMonth() + 1
                ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
                : null;

            const jsondata = {
                saId: user.user_id,
                date: formattedDate,
            };

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(jsondata),
                    operation: "displayLeaveRequest",
                },
            });

            setGetSaLeaveRequests(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching leave requests:", error);
        }
    }

    const submitLeave = async () => {
        if (!leaveType && !customLeaveType && !reason && !date) {
            alert("Please fill in all the fields");
            return;
        }

        const url =
            "http://localhost/nextjs/api/sa-monitoring/studentAssistant.php";

        const formattedDate = date
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(date.getDate()).padStart(2, "0")}`
            : null;

        const jsonData = {
            saId: user.user_id,
            leaveType: leaveType === "Other" ? customLeaveType : leaveType,
            reason: reason,
            date: formattedDate,
        };

        console.log(jsonData);

        const formData = new FormData();
        formData.append("operation", "SaLeaveRequest");
        formData.append("json", JSON.stringify(jsonData));

        const response = await axios({
            url: url,
            method: "POST",
            data: formData,
        });

        if (response.data == 1) {
            alert("Leave request submitted successfully");
            retrieveLeaveRequest(user.user_id, selectedDate, setGetSaLeaveRequests);
            setLeaveType("");
            setCustomLeaveType("");
            setReason("");
            setDate(null);
        } else {
            alert("Failed to submit leave request");
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


                    <h2 className="mb-3">Apply Leave</h2>

                    <div className="d-flex justify-content-end mb-4">
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                handleShowModal();
                            }}
                            className="rounded-pill px-4"
                        >
                            See Leave Request
                        </Button>
                    </div>

                    <Form className="p-4 rounded shadow-sm bg-light">
                        <Form.Group className="mb-3">
                            <Form.Label className="me-3">Leave Date</Form.Label>
                            <DatePicker
                                selected={date}
                                onChange={(date) => setDate(date)}
                                dateFormat="MMMM d, yyyy"
                                className="form-control rounded-pill border-1"
                                placeholderText="Select a date"
                            />
                        </Form.Group>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Leave Type</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={leaveType}
                                        onChange={(e) => setLeaveType(e.target.value)}
                                        className="rounded-pill border-1"
                                    >
                                        <option value="">Select leave type</option>
                                        <option value="Sick">Sick</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Other">Others</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>

                            {leaveType === "Other" && (
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Others (Please specify)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Please specify"
                                            value={customLeaveType}
                                            onChange={(e) => setCustomLeaveType(e.target.value)}
                                            className="rounded-pill border-1"
                                        />
                                    </Form.Group>
                                </Col>
                            )}
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Reason</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter reason for the leave..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="rounded border-1"
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            onClick={submitLeave}
                            className="rounded-pill px-4"
                        >
                            Submit
                        </Button>
                    </Form>
                </Container>
            </div>

            <Modal show={showLeaveRequest} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Leave Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="me-3">Select Date</Form.Label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                            }}
                            dateFormat="MMMM d, yyyy"
                            className="form-control rounded-pill border-1"
                            placeholderText="Select a date"
                        />
                    </Form.Group>

                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "center" }}>Leave Date</th>
                                <th style={{ textAlign: "center" }}>Leave Type</th>
                                <th style={{ textAlign: "center" }}>Reason</th>
                                <th style={{ textAlign: "center" }}>Approval Status</th>
                                <th style={{ textAlign: "center" }}>Approved By</th>
                                <th style={{ textAlign: "center" }}>Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getSaLeaveRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center" }}>
                                        No leave request for this date.
                                    </td>
                                </tr>
                            ) : (
                                getSaLeaveRequests.map((saLeaveRequest, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: "center" }}>
                                            {saLeaveRequest.formatted_date}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            {saLeaveRequest.leave_type}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <Form.Group>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={saLeaveRequest.reason}
                                                    className="rounded border-1"
                                                    style={{
                                                        resize: "none",
                                                        height: "80px",
                                                        backgroundColor: "#f8f9fa",
                                                    }}
                                                    disabled
                                                />
                                            </Form.Group>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${saLeaveRequest.approved_status_name === "Approved"
                                                    ? "bg-success"
                                                    : saLeaveRequest.approved_status_name === "Pending"
                                                        ? "bg-warning text-dark"
                                                        : "bg-danger"
                                                    }`}
                                            >
                                                {saLeaveRequest.approved_status_name}
                                            </span>
                                        </td>
                                        <td className="text-center text-secondary">
                                            <em>{saLeaveRequest.admin_fullname}</em>
                                        </td>
                                        <td>
                                            <Form.Group>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={saLeaveRequest.admin_comment}
                                                    className="rounded border-1"
                                                    style={{
                                                        resize: "none",
                                                        height: "80px",
                                                        backgroundColor: "#f8f9fa",
                                                    }}
                                                    disabled
                                                />
                                            </Form.Group>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ApplyLeave;
