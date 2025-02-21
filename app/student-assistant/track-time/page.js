"use client";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import SaNavbar from "@/components/student/navbar";
import { useEffect, useState, useCallback } from "react";
import { useLogout } from "@/components/student/logout";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";

const TrackTime = () => {
  const [saId, setSaId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [hasSchedule, setHasSchedule] = useState(false);
  const [scheduleId, setScheduleId] = useState(null); // To hold the selected duty schedule ID
  const [errorMessage, setErrorMessage] = useState(""); // To display error messages
  const logout = useLogout();
  const router = useRouter();

  const [getSaDutySchedule, setGetSaDutySchedule] = useState([]);
  const [getSaTimeIn, setGetSaTimeIn] = useState([]);

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
      retrieveSaTimeIn();
    }
  }, [saId]);

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

    // Check if the SA has a schedule for today
    const today = new Date().toLocaleString("en-us", { weekday: "long" }); // Get today's day name
    const scheduleToday = response.data.some((schedule) =>
      schedule.day_names.includes(today)
    );

    setHasSchedule(scheduleToday);

    if (scheduleToday) {
      const schedule = response.data.find((schedule) =>
        schedule.day_names.includes(today)
      );
      setScheduleId(schedule.duty_schedule_id); // Store the schedule ID for later
    }
  };

  const retrieveSaTimeIn = async () => {
    const url =
      "http://localhost/nextjs/api/sa-monitoring/studentAssistant.php";
    const jsonData = {
      saId: saId,
    };

    const response = await axios.get(url, {
      params: {
        json: JSON.stringify(jsonData),
        operation: "displaySaTimeInTrack",
      },
    });
    setGetSaTimeIn(response.data);
    console.log(response.data);
  };

  const SaTimeIn = async () => {
    if (!hasSchedule) {
      Swal.fire({
        title: "No Schedule Today",
        text: "You don't have a schedule today, so you cannot time in.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Time In Confirmation",
      text: "Are you sure you want to time in?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Time In",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const url =
      "http://localhost/nextjs/api/sa-monitoring/studentAssistant.php";

    const jsonData = {
      saId: saId,
      dutyScheduleId: scheduleId, // Pass the selected schedule ID
    };

    console.log(jsonData);

    const formData = new FormData();
    formData.append("operation", "SaTimeIn");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const response = await axios({
        url: url,
        method: "POST",
        data: formData,
      });

      if (response.data.success) {
        Swal.fire("Success!", response.data.message, "success");
        retrieveSaTimeIn();
      } else {
        Swal.fire("Warning!", response.data.message, "warning");
      }
    } catch (error) {
      Swal.fire("Error", "Network error. Please try again.", "error");
    }
  };

  const SaTimeOut = async () => {
    if (!hasSchedule) {
      Swal.fire({
        title: "No Schedule Today",
        text: "You don't have a schedule today, so you cannot time out.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (getSaTimeIn.length === 0) {
      setErrorMessage("You haven't timed in yet.");
      return;
    }

    const lastEntry = getSaTimeIn[getSaTimeIn.length - 1]; // Get the last time-in entry
    const trackId = lastEntry.track_id; // Get track_id from API response

    if (!trackId) {
      setErrorMessage("Invalid tracking ID. Please try again.");
      return;
    }

    const result = await Swal.fire({
      title: "Time In Confirmation",
      text: "Are you sure you want to time Out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Time Out",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const url =
      "http://localhost/nextjs/api/sa-monitoring/studentAssistant.php";
    const jsonData = {
      saId: saId,
      dutyScheduleId: scheduleId,
      trackId: trackId, // Include trackId
    };

    console.log(jsonData);

    const formData = new FormData();
    formData.append("operation", "SaTimeOut");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const response = await axios({
        url: url,
        method: "POST",
        data: formData,
      });

      if (response.data.success) {
        Swal.fire("Success", response.data.message, "success");
        retrieveSaTimeIn(); // Refresh the time-in data after timeout
      } else {
        Swal.fire("Warning", response.data.message, "warning");
      }
    } catch (error) {
      Swal.fire("Error!", "Network error. Please try again.", "error");
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
          <h2>Track Time</h2>

          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Button
            variant="success"
            className="fw-bold px-4 py-2 me-3 rounded-pill shadow"
            onClick={SaTimeIn}
            disabled={!hasSchedule}
          >
            {hasSchedule ? "Time In" : "No Schedule Today"}
          </Button>

          <Button
            variant="danger"
            className="fw-bold px-4 py-2 rounded-pill shadow"
            onClick={SaTimeOut}
            disabled={!hasSchedule}
          >
            {hasSchedule ? "Time Out" : "No Schedule Today"}
          </Button>

          <Table striped bordered hover responsive className="table-dark mt-4">
            <thead className="bg-primary text-white">
              <tr>
                <th className="fw-bold text-center">Date</th>
                <th className="fw-bold text-center">Day</th>
                <th className="fw-bold text-center">Time Schedule</th>
                <th className="fw-bold text-center">Time In</th>
                <th className="fw-bold text-center">Time Out</th>
                <th className="fw-bold text-center">Approved Status</th>
                <th className="fw-bold text-center">Status</th>
                <th className="fw-bold text-center">Approved By</th>
              </tr>
            </thead>
            <tbody className="table-light">
              {getSaTimeIn.map((timeIn, index) => (
                <tr key={index}>
                  <td className="text-center">{timeIn.formatted_date}</td>
                  <td className="text-center">{timeIn.day_name}</td>
                  <td className="text-center">{timeIn.time_schedule}</td>
                  <td className="text-center text-success fw-bold">
                    {timeIn.time_in}
                  </td>
                  <td className="text-center text-danger fw-bold">
                    {timeIn.time_out}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        timeIn.approved_status === "Approved"
                          ? "bg-success"
                          : timeIn.approved_status === "Pending"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                    >
                      {timeIn.approved_status}
                    </span>
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        timeIn.status === "On Time"
                          ? "bg-success"
                          : timeIn.status === "Late"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {timeIn.status}
                    </span>
                  </td>
                  <td className="text-center">{timeIn.admin_fullname}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </div>
    </>
  );
};

export default TrackTime;
