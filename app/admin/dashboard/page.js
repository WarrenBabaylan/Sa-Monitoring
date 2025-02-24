"use client";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/navbar";
import { Container, Spinner } from "react-bootstrap";
import { useLogout } from "@/components/admin/logout";
import { useEffect, useState, useCallback } from "react";

const Dashboard = () => {
  const [adminId, setAdminId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useLogout();
  const router = useRouter();

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
        </Container>
      </div>
    </>
  );
};

export default Dashboard;
