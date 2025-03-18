"use client";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { useLogout } from "@/components/logout";
import { useAuth } from "@/components/useAuth";
import { Container, Button, Table, Form, Spinner, Card, Toast, ToastContainer } from "react-bootstrap";
import ReusableModal from "@/components/modal";

const LeaveApproval = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const { user, isLoading, setIsLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const logout = useLogout();

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

    useEffect(() => {
        retrieveSaLeaveRequests();
        retrieveApprovedStatus();

    }, []);

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

    const [getSaLeaveRequests, setGetSaLeaveRequests] = useState([]);
    const [getSaLeaveRequestsById, setGetSaLeaveRequestsById] = useState([]);
    const [getApprovedStatus, setGetApprovedStatus] = useState([]);

    const [saFullname, setSaFullname] = useState("");
    const [date, setDate] = useState("");
    const [leaveType, setLeaveType] = useState("");
    const [reason, setReason] = useState("");

    const [approvedStatus, setApprovedStatus] = useState("");
    const [adminComment, setAdminComment] = useState("");

    //--------------- Modal ---------------//
    const [showApprovedModal, setShowApprovedModal] = useState(false);
    const handleCloseModal = () => setShowApprovedModal(false);
    const handleShowModal = () => setShowApprovedModal(true);

    const retrieveApprovedStatus = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "admin.php";

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: "displayApprovedStatus",
                },
            });
            setGetApprovedStatus(response.data);
        } catch (error) {
            setGetApprovedStatus([]);
        }
    };

    const selectedApprovedStatus = (event) => {
        setApprovedStatus(event.target.value);
    };

    const retrieveSaLeaveRequests = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "admin.php";

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: "displaySaLeaveRequest",
                },
            });
            setGetSaLeaveRequests(response.data);
        } catch (error) {
            setGetSaLeaveRequests(null);
        }
    };

    const retrieveSaLeaveRequestsById = async (leaveId) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "admin.php";

        const jsondata = {
            leaveId: leaveId,
        };

        const response = await axios.get(url, {
            params: {
                json: JSON.stringify(jsondata),
                operation: "displaySaLeaveRequest",
            },
        });
        setGetSaLeaveRequestsById(response.data);
        console.log(response.data);

        const SaLeave = response.data[0];
        setSaFullname(SaLeave.sa_fullname);
        setDate(SaLeave.formatted_date);
        setLeaveType(SaLeave.leave_type);
        setReason(SaLeave.reason);
        setApprovedStatus(SaLeave.approved_status);
    };

    const showModal = (leaveId) => {
        retrieveSaLeaveRequestsById(leaveId);
        handleShowModal(true);
    };

    const saveChanges = async () => {
        const leaveConfirm = window.confirm("Are you sure you want to submit?");
        if (!leaveConfirm) return;

        if (!approvedStatus || !adminComment) {
            showToast("danger", "Field are required.");
            return;
        }

        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "admin.php";

        const jsonData = {
            leaveId: getSaLeaveRequestsById[0]?.leave_id,
            approvedStatus: approvedStatus,
            adminComment: adminComment,
            adminId: user?.user_id,
        };

        const formData = new FormData();
        formData.append("operation", "ApprovedLeaveRequest");
        formData.append("json", JSON.stringify(jsonData));

        try {
            const response = await axios({
                url: url,
                method: "POST",
                data: formData,
            });

            if (response.data === 1) {
                showToast("success", "Leave request approved.");
                setAdminComment("");
                retrieveSaLeaveRequests();
            } else {
                showToast("warning", "Leave request failed!");
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
                    <Card className="shadow rounded-3 mt-3">
                        <Card.Header className="bg-primary text-white">
                            <h5>Leave Approval</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table
                                responsive
                                striped
                                bordered
                                hover
                                className="mb-0 text-center"
                                style={{ borderRadius: "8px", overflow: "hidden" }}
                            >
                                <thead className="bg-dark text-white">
                                    <tr>
                                        <th>Date</th>
                                        <th>Student Assistant</th>
                                        <th>Leave Type</th>
                                        <th>Reason</th>
                                        <th>Approved Status</th>
                                        <th>Comment</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted">
                                                Loading data, please wait...
                                            </td>
                                        </tr>
                                    ) : !Array.isArray(getSaLeaveRequests) ? (
                                        <tr>
                                            <td colSpan="7" className="text-center fw-bold">
                                                No data available. Please wait or check your connection.
                                            </td>
                                        </tr>
                                    ) : getSaLeaveRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted">
                                                No leave requests available.
                                            </td>
                                        </tr>
                                    ) : (
                                        getSaLeaveRequests.map((saLeaveRequest, index) => (
                                            <tr
                                                key={index}
                                                style={{ transition: "0.3s", cursor: "pointer" }}
                                                className="table-hover"
                                            >
                                                <td style={{ padding: "12px" }}>
                                                    {saLeaveRequest.formatted_date}
                                                </td>
                                                <td>{saLeaveRequest.sa_fullname}</td>
                                                <td>{saLeaveRequest.leave_type}</td>
                                                <td>
                                                    <textarea
                                                        className="form-control"
                                                        rows="2"
                                                        readOnly
                                                        value={saLeaveRequest.reason}
                                                    ></textarea>
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
                                                <td>
                                                    <textarea
                                                        className="form-control"
                                                        rows="2"
                                                        readOnly
                                                        value={saLeaveRequest.admin_comment}
                                                    ></textarea>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="px-3 d-flex align-items-center"
                                                        onClick={() => showModal(saLeaveRequest.leave_id)}
                                                    >
                                                        <i
                                                            className="bi bi-check-circle"
                                                            style={{ marginRight: "5px" }}
                                                        ></i>
                                                        Approve
                                                    </Button>
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

            {/* Modal for leave approval */}
            <ReusableModal
                showModal={showApprovedModal}
                handleCloseModal={handleCloseModal}
                title={"Leave Approval"}
                bodyContent={
                    <>
                        <Card className="shadow-sm rounded-3 p-3">
                            <Table borderless className="align-middle mb-0">
                                <tbody>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">📅 Date</td>
                                        <td className="text-dark">{date}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">👤 Student Assistant</td>
                                        <td className="text-dark">{saFullname}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">📋 Leave Type</td>
                                        <td className="text-dark">{leaveType}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">📝 Reason</td>
                                        <td>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="No reason provided"
                                                value={reason}
                                                readOnly
                                                className="form-control-plaintext border p-2 rounded bg-light"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">✅ Approved Status</td>
                                        <td>
                                            <Form.Select
                                                value={approvedStatus}
                                                onChange={selectedApprovedStatus}
                                                className="form-control shadow-sm"
                                            >
                                                <option value="">Select Approve Status</option>
                                                {
                                                    !Array.isArray(getApprovedStatus) || getApprovedStatus.length === 0 ? (
                                                        <option disabled>No results.</option>
                                                    ) : (
                                                        getApprovedStatus.map((approvedStatus, index) => (
                                                            <option key={index} value={approvedStatus.approved_status_id}>
                                                                {approvedStatus.approved_status_name}
                                                            </option>
                                                        ))
                                                    )
                                                }
                                            </Form.Select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">💬 Admin Comment</td>
                                        <td>
                                            <Form.Group>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="Enter comment..."
                                                    value={adminComment}
                                                    onChange={(e) => setAdminComment(e.target.value)}
                                                    className="border p-2 rounded shadow-sm"
                                                />
                                            </Form.Group>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card>
                    </>
                }
                footerContent={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                saveChanges();
                                handleCloseModal();
                            }}
                        >
                            Save Changes
                        </Button>
                    </>
                }
            />

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

export default LeaveApproval;
