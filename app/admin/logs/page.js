"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { useLogout } from "@/components/admin/logout";
import { useEffect, useState, useCallback } from "react";
import { Container, Spinner, Table, Pagination, Card } from "react-bootstrap";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 10;

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
    retrieveActivityLogs(currentPage);
  }, [currentPage]);

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

  const retrieveActivityLogs = async (page) => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";
    setLoading(true);
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({ limit: recordsPerPage, page }),
          operation: "displayActivityLog",
        },
      });
      setGetLogs(response.data.logs);
      setTotalRecords(response.data.totalRecords);
    } catch (error) {
      setGetLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
              <h5>Activity Logs</h5>
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
                    <th>Activity Logs</th>
                    <th>Admin</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        Loading data, please wait...
                      </td>
                    </tr>
                  ) : getLogs.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
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
            </Card.Body>

            <Pagination className="mt-2 justify-content-center">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              })}

              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default Logs;
