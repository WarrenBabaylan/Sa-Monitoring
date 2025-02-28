"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Container, Button, Table, Form, Spinner, Card } from "react-bootstrap";
import axios from "axios";
import ReusableModal from "@/components/modal";
import { useLogout } from "@/components/admin/logout";
import AdminNavbar from "@/components/admin/navbar";

const LeaveApproval = () => {
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
      retrieveSaLeaveRequests();
      retrieveApprovedStatus();
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

  const selectedApprovedStatus = (event) => {
    setApprovedStatus(event.target.value);
  };

  const retrieveSaLeaveRequests = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const retrieveSaLeaveRequestsById = async (leaveId) => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

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
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    const jsonData = {
      leaveId: getSaLeaveRequestsById[0].leave_id,
      approvedStatus: approvedStatus,
      adminComment: adminComment,
      adminId: adminId,
    };

    console.log(jsonData);

    const formData = new FormData();
    formData.append("operation", "ApprovedLeaveRequest");
    formData.append("json", JSON.stringify(jsonData));

    const response = await axios({
      url: url,
      method: "POST",
      data: formData,
    });

    if (response.data == 1) {
      alert("Leave Request approved!");
      setAdminComment("");
      retrieveSaLeaveRequests();
    } else {
      alert("Leave Request Failed!");
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
                      <td colSpan="7" className="text-center text-danger fw-bold">
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
            <Table>
              <tbody>
                <tr>
                  <td>Date</td>
                  <td>{date}</td>
                </tr>
                <tr>
                  <td>Student Assistant</td>
                  <td>{saFullname}</td>
                </tr>
                <tr>
                  <td>Leave Type</td>
                  <td>{leaveType}</td>
                </tr>
                <tr>
                  <td>Reason</td>
                  <td>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter reason for the leave..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="rounded border-1"
                        readOnly
                      />
                    </Form.Group>
                  </td>
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
                  <td>Comment</td>
                  <td>
                    <Form.Group className="mb-3">
                      <Form.Label>Reason</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter reason for the leave..."
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        className="rounded border-1"
                      />
                    </Form.Group>
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

export default LeaveApproval;
