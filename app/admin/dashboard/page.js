"use client";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { Container, Spinner, Card } from "react-bootstrap";
import { useLogout } from "@/components/admin/logout";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const Dashboard = () => {
  const [adminId, setAdminId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useLogout();
  const router = useRouter();

  const [getSAList, setGetSAList] = useState([]);

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

    const response = await axios.get(url, {
      params: {
        json: JSON.stringify({}),
        operation: "displayTotalSA",
      },
    });
    if (Array.isArray(response.data) && response.data.length > 0) {
      setGetSAList(response.data[0].student_assistant);
    } else {
      setGetSAList(0);
    }
    console.log(response.data);
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
          <Card
            style={{
              width: "18rem",
              marginTop: "20px",
              backgroundColor: "#2b59ff",
              color: "white",
            }}
          >
            <Card.Body>
              <Card.Title>Total Student Assistant</Card.Title>
              <h1 style={{ fontSize: "40px", textAlign: "center" }}>
                {getSAList}
              </h1>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default Dashboard;
