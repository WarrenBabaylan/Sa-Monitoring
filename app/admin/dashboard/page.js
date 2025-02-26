"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { useLogout } from "@/components/admin/logout";
import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Spinner,
  Card,
  Row,
  Col,
  Modal,
  Button,
  Tooltip as BootstrapTooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const Dashboard = () => {
  const [adminId, setAdminId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useLogout();
  const router = useRouter();

  const [getSAList, setGetSAList] = useState([]);
  const [getAdminList, setGetAdminList] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);

  const [totalSA, setTotalSA] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
  }, [router]);

  useEffect(() => {
    retrieveSAList();
    retrieveAdminList();
    retrieveAttendancePie();
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

  const retrieveSAList = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: "displayTotalSA",
        },
      });
      if (Array.isArray(response.data.students) && response.data.count) {
        setGetSAList(response.data.students);
        setTotalSA(response.data.count);
      } else {
        setGetSAList([]);
        setTotalSA(0);
      }
      console.log(response.data);
    } catch (error) {
      //console.error("Error fetching student assistant data:", error);
      setGetSAList([]);
      setTotalSA(0);
    }
  };

  const retrieveAdminList = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    const response = await axios.get(url, {
      params: {
        json: JSON.stringify({}),
        operation: "displayTotalAdmin",
      },
    });
    if (Array.isArray(response.data) && response.data.length > 0) {
      setGetAdminList(response.data[0].admin);
    } else {
      setGetAdminList(0);
    }
    console.log(response.data);
  };

  const retrieveAttendancePie = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: "displayAttedancePie",
        },
      });

      console.log("Raw API Response:", response.data);

      if (Array.isArray(response.data) && response.data.length > 0) {
        const { total_present, total_late, total_absent } = response.data[0];

        // Structure the data for Chart.js
        const pieData = {
          labels: ["Present", "Late", "Absent"],
          datasets: [
            {
              data: [total_present, total_late, total_absent],
              backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
            },
          ],
        };
        setAttendanceData(pieData);
      } else {
        console.error("Unexpected API response format", response.data);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
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
          <h2>Admin Dashboard</h2>

          <Row className="mt-4">
            <Col
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="d-flex justify-content-center"
            >
              <Card
                style={{
                  width: "18rem",
                  backgroundColor: "#2b59ff",
                  color: "white",
                }}
              >
                <Card.Body>
                  <Card.Title>Total Admin</Card.Title>
                  <h1 style={{ fontSize: "40px", textAlign: "center" }}>
                    {getAdminList}
                  </h1>
                </Card.Body>
              </Card>
            </Col>

            <Col
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="d-flex justify-content-center"
            >
              <Card
                style={{
                  width: "18rem",
                  backgroundColor: "#2b59ff",
                  color: "white",
                  cursor: "pointer",
                }}
                onClick={() => setShowModal(true)}
              >
                <Card.Body>
                  <Card.Title>Total Student Assistant</Card.Title>
                  <h1 style={{ fontSize: "40px", textAlign: "center" }}>
                    {totalSA}
                  </h1>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-3 justify-content-start">
            <Col xs={12} md={6} lg={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Attendance Overview</Card.Title>
                  <div style={{ width: "280px", height: "280px", marginLeft: "0" }}>
                    {attendanceData ? (
                      <Pie data={attendanceData} options={{ maintainAspectRatio: false }} />
                    ) : (
                      <p>Loading chart...</p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Student Assistant List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {getSAList.length > 0 ? (
            <ul className="list-group">
              {getSAList.map((sa) => (
                <li key={sa.sa_id} className="list-group-item">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <BootstrapTooltip id={`tooltip-${sa.sa_id}`}>
                        {sa.total_duty_hours_formatted} / {sa.required_duty_hours}
                      </BootstrapTooltip>
                    }
                  >
                    <span
                      style={{ cursor: "pointer" }}
                    >
                      {sa.sa_fullname}
                    </span>
                  </OverlayTrigger>
                </li>
              ))}
            </ul>
          ) : (
            <p>No student assistants found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Dashboard;
