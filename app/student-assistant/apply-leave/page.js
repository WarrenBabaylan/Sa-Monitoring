"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
import { useLogout } from "@/components/student/logout";
import { retrieveLeaveRequest } from "@/components/student/retrieveLeaveRequests";
import SaNavbar from "@/components/student/navbar";
import ReusableModal from "@/components/modal";

const Leave = () => {
  const [saId, setSaId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const logout = useLogout();

  const [leaveType, setLeaveType] = useState("");
  const [customLeaveType, setCustomLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(null);

  const [getSaLeaveRequests, setGetSaLeaveRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const storedSaId = sessionStorage.getItem("saId");
    const storedFirstname = sessionStorage.getItem("firstname");
    const storedLastname = sessionStorage.getItem("lastname");

    if (!storedSaId) {
      router.push("/");
    } else {
      setSaId(storedSaId);
      setFirstname(storedFirstname);
      setLastname(storedLastname);
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (selectedDate) {
      retrieveLeaveRequest(saId, selectedDate, setGetSaLeaveRequests);
    }
  }, [saId, selectedDate]);

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

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  //--------------- Modal ---------------//
  const [showLeaveRequest, setShowLeaveRequest] = useState(false);
  const handleCloseModal = () => setShowLeaveRequest(false);
  const handleShowModal = () => setShowLeaveRequest(true);

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
      saId: saId,
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
      retrieveLeaveRequest(saId, selectedDate, setGetSaLeaveRequests);
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

  return (
    <>
      <SaNavbar
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
              </tr>
            </thead>
            <tbody>
              {getSaLeaveRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
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
                        className={`badge ${
                          saLeaveRequest.approved_status_name === "Approved"
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

export default Leave;
