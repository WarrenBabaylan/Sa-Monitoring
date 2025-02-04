"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLogout } from "@/components/student/logout";
import { Container, Table, Spinner } from "react-bootstrap";
import SaNavbar from "@/components/student/navbar";

const Dashboard = () => {
  const [saId, setSaId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useLogout();
  const router = useRouter();

  const [getSaDutySchedule, setGetSaDutySchedule] = useState([]);

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
    if (saId !== null) {
      retrieveSaDutySchedule();
    }
  }, [saId]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible((prev) => !prev);
  }, []);

  const retrieveSaDutySchedule = async () => {
    const url =
      "http://localhost/nextjs/api/sa-monitoring/studentAssistant.php";

    const jsonData = {
      saId: saId,
    };

    const response = await axios.get(url, {
      params: {
        json: JSON.stringify(jsonData),
        operation: "displaySaDutySchedule",
      },
    });
    setGetSaDutySchedule(response.data);
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
          <h1>Dashboard</h1>

          <Table>
            <thead>
              <tr>
                <td>Day Schedule</td>
                <td>Time Schedule</td>
                <td>Total Duty Hours</td>
                <td>Rendered Duty Hours</td>
                <td>Required Duty Hours</td>
              </tr>
            </thead>
            <tbody>
              {getSaDutySchedule.map((saDutySchedule, index) => {
                return (
                  <tr key={index}>
                    <td>{saDutySchedule.day_names}</td>
                    <td>{saDutySchedule.time_schedule}</td>
                    <td>{saDutySchedule.total_duty_hours_formatted}</td>
                    <td>{saDutySchedule.rendered_vs_required}</td>
                    <td>{saDutySchedule.required_duty_hours}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Container>
      </div>
    </>
  );
};

export default Dashboard;
