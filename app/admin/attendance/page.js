"use client";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { useLogout } from "@/components/logout";
import { useAuth } from "@/components/useAuth";
import { Container, Table, Button, Form, Spinner, Card } from "react-bootstrap";
import ReusableModal from "@/components/modal";

const DutyHours = () => {
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
        retrieveAllSaTimeInTrack();
        retrieveApprovedStatus();
        retrieveStatus();
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

    //--------------- Time-in Approval Modal ---------------//
    const [date, setDate] = useState("");
    const [daySched, setDaySched] = useState("");
    const [startTime, setStartTime] = useState("");
    const [time, setTime] = useState("");
    const [saFullname, setSaFullname] = useState("");

    const [status, setStatus] = useState("");
    const [approvedStatus, setApprovedStatus] = useState("");

    //--------------- retrieving time-in data ---------------//
    const [getAllSaTimeIn, setGetAllSaTimeIn] = useState([]);
    const [getTimeInById, setGetTimeInById] = useState([]);

    const [getApprovedStatus, setGetApprovedStatus] = useState([]);
    const [getStatus, setGetStatus] = useState([]);

    //--------------- Modal ---------------//
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    const retrieveApprovedStatus = async () => {
        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        const response = await axios.get(url, {
            params: {
                json: JSON.stringify({}),
                operation: "displayApprovedStatus",
            },
        });
        setGetApprovedStatus(response.data);
        console.log(response.data);
    };

    const retrieveStatus = async () => {
        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        const response = await axios.get(url, {
            params: {
                json: JSON.stringify({}),
                operation: "displayStatus",
            },
        });
        setGetStatus(response.data);
        console.log(response.data);
    };

    const selectedApprovedStatus = (event) => {
        setApprovedStatus(event.target.value);
    };

    const selectedStatus = (event) => {
        setStatus(event.target.value);
    };

    const retrieveAllSaTimeInTrack = async () => {
        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: "displaySaTimeIn",
                },
            });
            setGetAllSaTimeIn(response.data);
        } catch (error) {
            setGetAllSaTimeIn(null);
        }
    };

    const retrieveAllSaTimeInTrackById = async (timeInId) => {
        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        const jsonData = {
            timeInId: timeInId,
        };

        const response = await axios.get(url, {
            params: {
                json: JSON.stringify(jsonData),
                operation: "displaySaTimeIn",
            },
        });
        setGetTimeInById(response.data);
        console.log(response.data);

        const saTimeIn = response.data[0];

        setDate(saTimeIn.formatted_date);
        setDaySched(saTimeIn.day_name);
        setStartTime(saTimeIn.time_start);
        setTime(saTimeIn.time_in);
        setSaFullname(saTimeIn.sa_fullname);

        const convertToMinutes = (timeStr) => {
            const [time, modifier] = timeStr.split(" ");
            let [hours, minutes] = time.split(":").map(Number);

            if (modifier === "PM" && hours !== 12) {
                hours += 12;
            } else if (modifier === "AM" && hours === 12) {
                hours = 0;
            }

            return hours * 60 + minutes;
        };

        const timeStartMinutes = convertToMinutes(saTimeIn.time_start);
        const timeInMinutes = convertToMinutes(saTimeIn.time_in);

        let statusId = "";
        if (timeInMinutes >= timeStartMinutes + 30) {
            const lateStatus = getStatus.find((s) => s.status_name === "Late");
            statusId = lateStatus ? lateStatus.status_id : "";
        } else {
            const presentStatus = getStatus.find((s) => s.status_name === "Present");
            statusId = presentStatus ? presentStatus.status_id : "";
        }

        setStatus(statusId);
    };

    const showApprovedModal = (timeInId) => {
        retrieveAllSaTimeInTrackById(timeInId);
        handleShowModal(true);
    };

    const saveChanges = async () => {

        const confirmApproved = confirm("Are you sure you want to approved?");
        if (!confirmApproved) return;

        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        const jsonData = {
            time_in_id: getTimeInById[0].track_id,
            approvedStatus: approvedStatus,
            status: status,
            adminId: user.user_id,
        };

        console.log(jsonData);

        const formData = new FormData();
        formData.append("operation", "TimeInApprove");
        formData.append("json", JSON.stringify(jsonData));

        const response = await axios({
            url: url,
            method: "POST",
            data: formData,
        });

        if (response.data === 1) {
            alert("Approval successful!");
            retrieveAllSaTimeInTrack();
        } else {
            alert("Approval failed! Please try again.");
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
                            <h5>Attendance Review</h5>
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
                                        <th>Day Schedule</th>
                                        <th>Time Schedule</th>
                                        <th>Time-in</th>
                                        <th>Time-out</th>
                                        <th>Approved Status</th>
                                        <th>Status</th>
                                        <th>Student Assistant</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9" className="text-center text-muted">
                                                Loading data, please wait...
                                            </td>
                                        </tr>
                                    ) : !Array.isArray(getAllSaTimeIn) ? (
                                        <tr>
                                            <td colSpan="9" className="text-center text-danger fw-bold">
                                                No data available. Please wait or check your connection.
                                            </td>
                                        </tr>
                                    ) : getAllSaTimeIn.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center text-muted">
                                                No attendance records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        getAllSaTimeIn.map((timeIn, index) => (
                                            <tr
                                                key={index}
                                                style={{ transition: "0.3s", cursor: "pointer" }}
                                                className="table-hover"
                                            >
                                                <td style={{ padding: "12px" }}>{timeIn.formatted_date}</td>
                                                <td>{timeIn.day_name}</td>
                                                <td>{timeIn.time_start} - {timeIn.time_end}</td>
                                                <td>{timeIn.time_in}</td>
                                                <td>{timeIn.time_out}</td>
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
                                                <td>{timeIn.sa_fullname}</td>
                                                <td>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="px-3 d-flex align-items-center"
                                                        onClick={() => showApprovedModal(timeIn.track_id)}
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

            {/* Modal for time-in approval */}
            <ReusableModal
                showModal={showModal}
                handleCloseModal={handleCloseModal}
                title={"Time-in Approval"}
                bodyContent={
                    <div className="modal-body-content">
                        <Card className="shadow-sm rounded-3 p-3">
                            <Table borderless className="align-middle mb-0">
                                <tbody>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">📅 Date</td>
                                        <td className="text-dark">{date}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">📆 Day Schedule</td>
                                        <td className="text-dark">{daySched}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">⏰ Time Start</td>
                                        <td className="text-dark">{startTime}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">⏳ Time In</td>
                                        <td className="text-dark">{time}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">👤 Student Assistant</td>
                                        <td className="text-dark">{saFullname}</td>
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
                                                {getApprovedStatus.map((approvedStatus, index) => (
                                                    <option key={index} value={approvedStatus.approved_status_id}>
                                                        {approvedStatus.approved_status_name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="fw-semibold text-muted text-nowrap">📌 Status</td>
                                        <td>
                                            <Form.Select
                                                value={status}
                                                onChange={selectedStatus}
                                                className="form-control shadow-sm"
                                            >
                                                <option value="">Select Status</option>
                                                {getStatus.map((status, index) => (
                                                    <option key={index} value={status.status_id}>
                                                        {status.status_name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card>
                    </div>
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
        </>
    );
};

export default DutyHours;
