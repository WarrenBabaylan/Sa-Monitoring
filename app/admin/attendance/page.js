"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Container, Table, Button, Form, Spinner, Card } from "react-bootstrap";
import ReusableModal from "@/components/modal";
import { useLogout } from "@/components/admin/logout";
import AdminNavbar from "@/components/admin/navbar";

const Attendance = () => {
  const [adminId, setAdminId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useLogout();
  const router = useRouter();

  useEffect(() => {
    const storedAdminId = sessionStorage.getItem("adminId");
    const storedFirstname = sessionStorage.getItem("firstname");
    const storedLastname = sessionStorage.getItem("lastname");

    if (!storedAdminId) {
      router.push("/");
    } else {
      setAdminId(storedAdminId);
      setFirstname(storedFirstname);
      setLastname(storedLastname);
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (adminId !== null) {
      retrieveAllSaTimeInTrack();
      retrieveApprovedStatus();
      retrieveStatus();
    }
  }, [adminId]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarVisible(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

    setLoading(true);
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
    } finally {
      setLoading(false);
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
  };

  const showApprovedModal = (timeInId) => {
    retrieveAllSaTimeInTrackById(timeInId);
    handleShowModal(true);
  };

  const saveChanges = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    const jsonData = {
      time_in_id: getTimeInById[0].track_id,
      approvedStatus: approvedStatus,
      status: status,
      adminId: adminId,
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

  return (
    <>
      <AdminNavbar
        firstname={firstname}
        lastname={lastname}
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
              <h5>Attendace Review</h5>
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
                        <td>{timeIn.time_schedule}</td>
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
          <>
            <Table>
              <tbody>
                <tr>
                  <td>Date</td>
                  <td>{date}</td>
                </tr>
                <tr>
                  <td>Day Schedule</td>
                  <td>{daySched}</td>
                </tr>
                <tr>
                  <td>Time Start</td>
                  <td>{startTime}</td>
                </tr>
                <tr>
                  <td>Time In</td>
                  <td>{time}</td>
                </tr>
                <tr>
                  <td>Student Assistant</td>
                  <td>{saFullname}</td>
                </tr>
                <tr>
                  <td>Approved Status</td>
                  <td>
                    <Form.Select
                      value={approvedStatus}
                      onChange={selectedApprovedStatus}
                      className="mb-3"
                    >
                      <option value="">Select Approve Status</option>
                      {getApprovedStatus.map((approvedStatus, index) => {
                        return (
                          <option
                            key={index}
                            value={approvedStatus.approved_status_id}
                          >
                            {approvedStatus.approved_status_name}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
                    <Form.Select
                      value={status}
                      onChange={selectedStatus}
                      className="mb-3"
                    >
                      <option value="">Select Status</option>
                      {getStatus.map((status, index) => {
                        return (
                          <option key={index} value={status.status_id}>
                            {status.status_name}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </td>
                </tr>
              </tbody>
            </Table>
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
    </>
  );
};

export default Attendance;
