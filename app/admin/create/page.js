"use client";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { useLogout } from "@/components/logout";
import { useAuth } from "@/components/useAuth";
import {
    Container,
    Button,
    Form,
    Modal,
    Spinner,
    Table,
    Card,
} from "react-bootstrap";
import ReusableModal from "@/components/modal";
import FormField from "@/components/form";

const Create = () => {
    const { user, isLoading, setIsLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
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
        retrieveAllSa();
    }, [])

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

    const [saId, setSaId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [getAllSa, setGetAllSa] = useState([]);
    const [getSaById, setGetSaById] = useState([]);

    //------------------- Modal --------------------------//
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    //--------------- Create new Sa Account ----------------//
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [studentId, setStudentId] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [alertShow, setAlertShow] = useState({
        show: false,
        variant: "success",
        message: "",
    });

    const showAlert = (variant, message) => {
        setAlertShow({ show: true, variant, message });
        setTimeout(() => {
            setAlertShow((prev) => ({ ...prev, show: false }));
        }, 900);
    };

    const retrieveAllSa = async () => {
        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({}),
                    operation: "displayAllSa",
                },
            });
            setGetAllSa(response.data);
        } catch (error) {
            setGetAllSa(null);
        }
    };

    const retrieveSaById = async (saId) => {
        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        const jsonData = {
            saId: saId,
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(jsonData),
                    operation: "displayAllSa",
                },
            });
            if (!response.data || response.data.length === 0) {
                showAlert("danger", "Student Assistant not found.");
                return false;
            }

            const student = response.data[0];
            setGetSaById(response.data);
            setSaId(student.sa_id);
            return true;
        } catch (error) {
            showAlert("danger", "Error retrieving student assistant data.");
            return false;
        }
    };

    const showAssignSched = async (saId) => {
        const found = await retrieveSaById(saId);
        if (found) {
            router.push(`/admin/create/assign?saId=${saId}`);
        }
    };

    const submit = async () => {
        if (!firstname && !lastname && !studentId) {
            showAlert("danger", "Please fill up all fields!");
            return;
        } else if (!firstname) {
            showAlert("warning", "Firstname is required!");
            return;
        } else if (!lastname) {
            showAlert("warning", "Lastname is required!");
            return;
        } else if (!studentId) {
            showAlert("warning", "Student Id is required!");
            return;
        }

        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        setPassword(lastname);
        setUsername(studentId);
        const jsonData = {
            firstname: firstname,
            lastname: lastname,
            studentId: studentId,
            username: studentId,
            password: lastname.toLowerCase(),
            adminId: user.user_id,
        };

        console.log(jsonData);

        const formData = new FormData();
        formData.append("operation", "createSaAccount");
        formData.append("json", JSON.stringify(jsonData));

        try {
            const response = await axios({
                url: url,
                method: "POST",
                data: formData,
            });

            if (response.data == 1) {
                showAlert("success", "Account created successfully!");
                setFirstname("");
                setLastname("");
                setStudentId("");
                setUsername("");
                setPassword("");
                retrieveAllSa();
            } else if (response.data == 2) {
                showAlert("danger", "Username already exists!");
            } else {
                showAlert("warning", "Account creation failed!");
            }
        } catch (error) {
            showAlert("danger", "Network error. Please try again.");
        }
    };

    const filteredSa = (Array.isArray(getAllSa) ? getAllSa : []).filter(
        (sa) =>
            sa.sa_fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sa.student_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                    {alertShow.show && (
                        <Modal
                            show={alertShow.show}
                            onHide={() => setAlertShow({ ...alertShow, show: false })}
                            centered
                            backdrop="static"
                            keyboard={false}
                        >
                            <Modal.Body
                                style={{
                                    backgroundColor: "#f0f0f5",
                                    borderRadius: "12px",
                                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
                                    padding: "20px",
                                    textAlign: "center",
                                }}
                            >
                                <h5
                                    style={{
                                        color:
                                            alertShow.variant === "danger"
                                                ? "#d9534f"
                                                : alertShow.variant === "warning"
                                                    ? "#f0ad4e"
                                                    : "#5cb85c",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {alertShow.message}
                                </h5>
                            </Modal.Body>
                        </Modal>
                    )}

                    <Button
                        variant="primary"
                        className="mb-1"
                        onClick={() => {
                            handleShowModal();
                        }}
                    >
                        Create
                    </Button>

                    <Card className="shadow rounded-3 mt-4">
                        <Card.Header className="bg-primary text-white">
                            <h5>Student Assistant Schedule</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Control
                                type="search"
                                placeholder="Search student assistant"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mb-3"
                            />
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
                                        <th>Student ID</th>
                                        <th>Student Assistant</th>
                                        <th>Day Schedule</th>
                                        <th>Time Schedule</th>
                                        <th>Required Duty Hours</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted">
                                                Loading data, please wait...
                                            </td>
                                        </tr>
                                    ) : !Array.isArray(getAllSa) ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="text-center text-danger fw-bold"
                                            >
                                                No data available. Please wait or check your connection.
                                            </td>
                                        </tr>
                                    ) : filteredSa.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted">
                                                No student assistants available.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSa.map((sa, index) => (
                                            <tr
                                                key={index}
                                                style={{ transition: "0.3s", cursor: "pointer" }}
                                                className="table-hover"
                                            >
                                                <td style={{ padding: "12px" }}>{sa.student_id}</td>
                                                <td style={{ padding: "12px" }}>{sa.sa_fullname}</td>
                                                <td>{sa.day_names}</td>
                                                <td>{sa.time_schedule}</td>
                                                <td>{sa.required_duty_hours}</td>
                                                <td>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="px-3 d-flex align-items-center"
                                                        onClick={() => showAssignSched(sa.sa_id)}
                                                    >
                                                        <i
                                                            className="bi bi-calendar-check"
                                                            style={{ marginRight: "5px" }}
                                                        ></i>
                                                        Assign
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

            {/* Add student assistant */}
            <ReusableModal
                showModal={showModal}
                handleCloseModal={handleCloseModal}
                title={"Add Student Assistant"}
                bodyContent={
                    <>
                        <Form
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    submit();
                                }
                            }}
                        >
                            <FormField
                                label={"Firstname"}
                                type={"text"}
                                placeholder={"enter firstname"}
                                value={firstname}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                        setFirstname(value);
                                    }
                                }}
                            />

                            <FormField
                                label={"Lastname"}
                                type={"text"}
                                placeholder={"enter lastname"}
                                value={lastname}
                                onChange={(e) => {
                                    setLastname(e.target.value);
                                }}
                            />

                            <FormField
                                label={"Student ID"}
                                type={"text"}
                                placeholder={"enter student id"}
                                value={studentId}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        // Allows only digits (0-9)
                                        setStudentId(value);
                                    }
                                }}
                            />
                        </Form>
                    </>
                }
                footerContent={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={submit} disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    Loading...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </>
                }
            />
        </>
    );
};

export default Create;
