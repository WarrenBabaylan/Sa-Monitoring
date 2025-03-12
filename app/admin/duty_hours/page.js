"use client";
import axios from "axios";
import * as Icon from "react-bootstrap-icons";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { useLogout } from "@/components/logout";
import { useAuth } from "@/components/useAuth";
import { Container, Button, Spinner, Table, Form, Card, Toast, ToastContainer } from "react-bootstrap";
import FormField from "@/components/form";

const DutyHours = () => {
    const { user, isLoading, setIsLoading } = useAuth();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const router = useRouter();
    const logout = useLogout();

    const [hours, setHours] = useState("");
    const [dutyHoursList, setDutyHoursList] = useState([]);
    const [selectedDutyHours, setSelectedDutyHours] = useState([]);

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

    const checkDutyHours = async () => {
        if (!hours) return;

        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";
        const checkData = { requiredDutyHours: hours };

        try {
            const formData = new FormData();
            formData.append("operation", "checkDutyHours");
            formData.append("json", JSON.stringify(checkData));

            const response = await axios.post(url, formData);

            if (response.data.exists) {
                showToast("warning", "Duty hours already exist.");
                return;
            }

            const newEntry = {
                id: Date.now(),
                requiredDutyHours: hours,
                adminId: user.user_id,
            };

            const updatedDutyHoursList = [...dutyHoursList, newEntry];
            setDutyHoursList(updatedDutyHoursList);
            sessionStorage.setItem("pendingDutyHours", JSON.stringify(updatedDutyHoursList));

            setHours("");
        } catch (error) {
            console.error("Error checking duty hours:", error);
            showToast("danger", "Network error. Please try again.");
        }
    };

    useEffect(() => {
        const storedDutyHours = sessionStorage.getItem("pendingDutyHours");
        if (storedDutyHours) {
            setDutyHoursList(JSON.parse(storedDutyHours));
        }
    }, []);

    const removeDutyHours = (id) => {
        const updatedList = dutyHoursList.filter(entry => entry.id !== id);
        setDutyHoursList(updatedList);
        setSelectedDutyHours(selectedDutyHours.filter(entryId => entryId !== id));

        sessionStorage.setItem("pendingDutyHours", JSON.stringify(updatedList));
    };

    const toggleSelect = (id) => {
        setSelectedDutyHours(prev =>
            prev.includes(id) ? prev.filter(entryId => entryId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedDutyHours.length === dutyHoursList.length) {
            setSelectedDutyHours([]);
        } else {
            setSelectedDutyHours(dutyHoursList.map(entry => entry.id)); // Select all
        }
    };

    const saveToBackend = async () => {
        if (selectedDutyHours.length === 0) return;

        const confirmAddDutyHours = confirm("Are you sure to add new duty hours?");
        if (!confirmAddDutyHours) return;

        const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

        const selectedData = dutyHoursList
            .filter(entry => selectedDutyHours.includes(entry.id))
            .map(entry => ({
                requiredDutyHours: entry.requiredDutyHours,
                adminId: user.user_id,
            }));

        const formData = new FormData();
        formData.append("operation", "addDutyHours");
        formData.append("json", JSON.stringify(selectedData));

        try {
            const response = await axios.post(url, formData);

            if (response.status !== 200) {
                throw new Error("Server error");
            }

            const responseData = response.data;

            if (responseData == 1) {
                showToast("success", "Duty hours added successfully.");

                const updatedList = dutyHoursList.filter(entry => !selectedDutyHours.includes(entry.id));
                setDutyHoursList(updatedList);
                setSelectedDutyHours([]);

                sessionStorage.setItem("pendingDutyHours", JSON.stringify(updatedList));
            } else {
                showToast("warning", "Failed to add duty hours.");
            }
        } catch (error) {
            console.error("Error adding duty hours:", error);
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

                    <h2>Add Duty Hours</h2>

                    <FormField
                        label={"Duty Hours"}
                        type={"number"}
                        placeholder={"enter duty hours"}
                        value={hours}
                        onChange={(e) => {
                            setHours(e.target.value);
                        }}
                    />

                    <Button variant="primary" onClick={checkDutyHours} disabled={!hours}>
                        Submit
                    </Button>

                    {dutyHoursList.length > 0 && (
                        <>
                            <h5 className="mt-4">Pending Duty Hours</h5>
                            <Card className="shadow-sm rounded-3 p-3">
                                <Table striped bordered hover responsive className="text-center align-middle mb-0">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            <th style={{ width: "5%" }}>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedDutyHours.length === dutyHoursList.length && dutyHoursList.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="form-check-lg"
                                                />
                                            </th>
                                            <th>Duty Hours</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dutyHoursList.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-muted py-3">No duty hours available.</td>
                                            </tr>
                                        ) : (
                                            dutyHoursList.map((entry) => (
                                                <tr key={entry.id}>
                                                    <td>
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={selectedDutyHours.includes(entry.id)}
                                                            onChange={() => toggleSelect(entry.id)}
                                                            className="form-check-lg"
                                                        />
                                                    </td>
                                                    <td>{entry.requiredDutyHours} hours</td>
                                                    <td className="text-end">
                                                        <Button
                                                            variant="danger"
                                                            className="d-flex align-items-center px-3 shadow-sm rounded"
                                                            onClick={() => removeDutyHours(entry.id)}
                                                        >
                                                            <Icon.Trash color="white" size={18} className="me-1" /> Remove
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </Card>

                            {selectedDutyHours.length > 0 && (
                                <Button variant="success" onClick={saveToBackend}>
                                    Save
                                </Button>
                            )}
                        </>
                    )}
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

export default DutyHours;
