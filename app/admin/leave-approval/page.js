"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Container, Button, Table, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import ReusableModal from "@/components/modal";
import { useLogout } from "@/components/admin/logout";
import AdminNavbar from "@/components/admin/navbar";

const LeaveApproval = () => {
  const [adminId, setAdminId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
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

  const [saFullname, setSaFullname] = useState("");
  const [date, setDate] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [approvedStatus, setApprovedStatus] = useState("Approved");

  //--------------- Modal ---------------//
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const handleCloseModal = () => setShowApprovedModal(false);
  const handleShowModal = () => setShowApprovedModal(true);

  const retrieveSaLeaveRequests = async () => {
    //const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";
    const url = "http://192.168.1.48/nextjs/api/sa-monitoring/admin.php";

    const response = await axios.get(url, {
      params: {
        json: JSON.stringify({}),
        operation: "displaySaLeaveRequest",
      },
    });
    setGetSaLeaveRequests(response.data);
    console.log(response.data);
  };

  const retrieveSaLeaveRequestsById = async (leaveId) => {
    //const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";
    const url = "http://192.168.1.48/nextjs/api/sa-monitoring/admin.php";

    const jsondata = {
      leaveId: leaveId,
    };

    const response = await axios.get(url, {
      params: {
        json: JSON.stringify(jsondata),
        operation: "displaySaLeaveRequestById",
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
          <h2>Leave request Approval</h2>

          <Table>
            <thead>
              <tr>
                <td>Student Assistant</td>
                <td>Date</td>
                <td>Leave Type</td>
                <td>Approved Status</td>
                <td>Approved By</td>
                <td>Action</td>
              </tr>
            </thead>
            <tbody>
              {getSaLeaveRequests.map((saLeaveRequest, index) => (
                <tr key={index}>
                  <td>{saLeaveRequest.sa_fullname}</td>
                  <td>{saLeaveRequest.formatted_date}</td>
                  <td>{saLeaveRequest.leave_type}</td>
                  <td>
                    <span
                      className={`badge ${
                        saLeaveRequest.approved_status === "Approved"
                          ? "bg-success"
                          : saLeaveRequest.approved_status === "Pending"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                    >
                      {saLeaveRequest.approved_status}
                    </span>
                  </td>
                  <td>
                    {saLeaveRequest.admin_fullname?.trim() || (
                      <span style={{ color: "gray", fontStyle: "italic" }}>
                        waiting to be approved...
                      </span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        showModal(saLeaveRequest.leave_id);
                      }}
                    >
                      Approve
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
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
                  <td>Student Assistant</td>
                  <td>{saFullname}</td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td>{date}</td>
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
                      onChange={(e) => setApprovedStatus(e.target.value)}
                      className="mb-3"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
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

export default LeaveApproval;
