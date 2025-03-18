"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/components/logout";
import {
    Button,
    Container,
    Form,
    Card,
    Row,
    Col,
    Modal,
    Table,
    Spinner,
    Toast,
    ToastContainer
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

    //--------------- Modal ---------------//
    const [showLeaveRequest, setShowLeaveRequest] = useState(false);
    const handleCloseModal = () => setShowLeaveRequest(false);
    const handleShowModal = () => setShowLeaveRequest(true);

    const retrieveLeaveRequest = async () => {
        try {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "studentAssistant.php";

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
        } catch (error) {
            setGetSaLeaveRequests([]);
        }
    }

    const submitLeave = async () => {
        if (!leaveType || (leaveType === "Other" && !customLeaveType) || !reason.trim() || !date) {
            showToast("warning", "Please fill in all the required fields.");
            return;
        }

        const confirmApplyLeave = window.confirm("Are you sure you want to submit leave?");
        if (!confirmApplyLeave) return;

        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "studentAssistant.php";

        const formattedDate = date
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(date.getDate()).padStart(2, "0")}`
            : null;

        const jsonData = {
            saId: user?.user_id,
            leaveType: leaveType === "Other" ? customLeaveType : leaveType,
            reason: reason.trim(),
            date: formattedDate,
        };

        const formData = new FormData();
        formData.append("operation", "SaLeaveRequest");
        formData.append("json", JSON.stringify(jsonData));

        try {
            const response = await axios({
                url: url,
                method: "POST",
                data: formData,
            });

            if (response.data === 1) {
                showToast("success", "Leave request submitted successfully.");
                retrieveLeaveRequest(user.user_id, selectedDate, setGetSaLeaveRequests);
                setLeaveType("");
                setCustomLeaveType("");
                setReason("");
                setDate(null);
            } else {
                showToast("warning", "Failed to submit leave request");
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

                    <Card className="shadow-sm rounded-4 border-0 mt-4">
                        <Card.Header className="bg-primary text-white">
                            <h5>Apply Leave</h5>
                        </Card.Header>
                        <Card.Body>
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

                            <Form>
                                {/* Leave Date Picker */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold me-2">Leave Date</Form.Label>
                                    <DatePicker
                                        selected={date}
                                        onChange={(date) => setDate(date)}
                                        dateFormat="MMMM d, yyyy"
                                        className="form-control rounded-3 border border-secondary shadow-sm"
                                        placeholderText="Select a date"
                                    />
                                </Form.Group>

                                {/* Leave Type and Other Leave Type */}
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Leave Type</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={leaveType}
                                                onChange={(e) => setLeaveType(e.target.value)}
                                                className="rounded-3 border border-secondary shadow-sm"
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
                                                <Form.Label className="fw-semibold">Other (Specify)</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter leave type"
                                                    value={customLeaveType}
                                                    onChange={(e) => setCustomLeaveType(e.target.value)}
                                                    className="rounded-3 border border-secondary shadow-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                    )}
                                </Row>

                                {/* Reason Input */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Reason</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Enter your reason for leave..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="rounded-3 border border-secondary shadow-sm"
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    onClick={submitLeave}
                                    className="rounded-pill px-5 shadow-sm"
                                >
                                    Submit
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
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

                    {/* Scrollable Table Container */}
                    <div style={{ overflowX: "auto", maxHeight: "60vh" }}>
                        <Table striped bordered hover responsive="sm">
                            <thead>
                                <tr>
                                    <th className="text-center">Leave Date</th>
                                    <th className="text-center">Leave Type</th>
                                    <th className="text-center">Reason</th>
                                    <th className="text-center">Approval Status</th>
                                    <th className="text-center">Approved By</th>
                                    <th className="text-center">Comment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getSaLeaveRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No leave request for this date.</td>
                                    </tr>
                                ) : (
                                    getSaLeaveRequests.map((saLeaveRequest, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{saLeaveRequest.formatted_date}</td>
                                            <td className="text-center">{saLeaveRequest.leave_type}</td>

                                            {/* Reason Column */}
                                            <td style={{ minWidth: "150px", maxWidth: "300px", wordBreak: "break-word", overflowWrap: "break-word" }}>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={saLeaveRequest.reason}
                                                    className="rounded border-1"
                                                    style={{
                                                        resize: "none",
                                                        backgroundColor: "#f8f9fa",
                                                    }}
                                                    disabled
                                                />
                                            </td>

                                            {/* Approval Status */}
                                            <td className="text-center">
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

                                            {/* Comment Column */}
                                            <td style={{ minWidth: "150px", maxWidth: "300px", wordBreak: "break-word", overflowWrap: "break-word" }}>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={saLeaveRequest.admin_comment}
                                                    className="rounded border-1"
                                                    style={{
                                                        resize: "none",
                                                        backgroundColor: "#f8f9fa",
                                                    }}
                                                    disabled
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Modal.Body>
            </Modal>


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

export default ApplyLeave;
