"use client";
import { useRouter } from "next/navigation";
import { Container, Spinner, Table } from "react-bootstrap";
import { useEffect, useState, useCallback } from "react";
import { useLogout } from "@/components/admin/logout";
import AdminNavbar from "@/components/admin/navbar";
import axios from "axios";

const Logs = () => {
  const [adminId, setAdminId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useLogout();
  const router = useRouter();

  const [getLogs, setGetLogs] = useState([]);

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
    retrieveActivityLogs();
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

  const retrieveActivityLogs = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";
    setLoading(true);
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: "displayActivityLog",
        },
      });
      setGetLogs(response.data);
      console.log(response.data);
    } catch (error) {
      setGetLogs(null);
    } finally {
      setLoading(false);
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
          <h2 className="mb-3">Activity Logs</h2>
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
                <th>Activity Logs</th>
                <th>Admin</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    Loading data, please wait...
                  </td>
                </tr>
              ) : !Array.isArray(getLogs) ? (
                <tr>
                  <td colSpan="4" className="text-center text-danger fw-bold">
                    No data available. Please wait or check your connection.
                  </td>
                </tr>
              ) : getLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No logs available.
                  </td>
                </tr>
              ) : (
                getLogs.map((activityLogs, index) => (
                  <tr key={index} className="align-middle">
                    <td className="text-start text-break">
                      {activityLogs.action}
                    </td>
                    <td className="text-center">{activityLogs.admin_name}</td>
                    <td className="text-center">
                      {activityLogs.formatted_timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Container>
      </div>
    </>
  );
};

export default Logs;
