"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
  Button,
  Modal,
  Card,
  Badge,
  Spinner,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import FormField from "@/components/form";

const AssignSchedule = () => {
  const [adminId, setAdminId] = useState(null);
  const searchParams = useSearchParams();
  const saId = searchParams.get("saId");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedAdminId = sessionStorage.getItem("adminId");
    if (!storedAdminId) {
      router.push("/");
    } else {
      setAdminId(storedAdminId);
      setIsLoading(false);
    }
  }, [router]);

  const [getDays, setGetDays] = useState([]);
  const [getDutyHours, setGetDutyHours] = useState([]);

  const [days, setDays] = useState("");
  const [selectedDays, setSelectedDays] = useState([]); // To store selected days
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dutyHours, setDutyHours] = useState("");

  useEffect(() => {
    retrieveDays();
    retrieveDutyHours();
  }, []);

  const [alertShow, setAlertShow] = useState({
    show: false,
    variant: "success",
    message: "",
  });

  const showAlert = (variant, message) => {
    setAlertShow({ show: true, variant, message });
    setTimeout(() => {
      setAlertShow((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const retrieveDays = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    setLoading(true);
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: "displayDays",
        },
      });
      setGetDays(response.data);
    } catch (error) {
      setGetDays([]);
    } finally {
      setLoading(false);
    }
  };

  const retrieveDutyHours = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    setLoading(true);
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: "displayDutyHours",
        },
      });
      setGetDutyHours(response.data);
    } catch (error) {
      setGetDutyHours(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionDay = (event) => {
    const selectedDay = getDays.find(
      (day) => day.day_id === event.target.value
    );
    if (
      selectedDay &&
      !selectedDays.some((d) => d.day_id === selectedDay.day_id)
    ) {
      setSelectedDays((prev) => [...prev, selectedDay]);
    }
    setDays("");
  };

  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
  };

  const handleEndTimeChange = (event) => {
    setEndTime(event.target.value);
  };

  const selectedDutyHours = (event) => {
    setDutyHours(event.target.value);
  };

  const removeDay = (dayId) => {
    setSelectedDays((prev) => prev.filter((day) => day.day_id !== dayId));
  };

  const submitAssignSched = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    const jsonData = {
      saId: saId,
      dayIds: selectedDays.map((day) => day.day_id),
      startTime: convertTo24HourFormat(startTime),
      endTime: convertTo24HourFormat(endTime),
      dutyHours: dutyHours,
      adminId: adminId,
    };

    console.log(jsonData);

    const formData = new FormData();
    formData.append("operation", "assignSaDutySchedule");
    formData.append("json", JSON.stringify(jsonData));

    const response = await axios({
      url: url,
      method: "POST",
      data: formData,
    });

    if (response.data == 1) {
      showAlert("success", "Assigned schedule successfully");
      router.push("/admin/create");
      setSelectedDays([]);
      setStartTime("");
      setEndTime("");
      setDutyHours("");
    } else {
      showAlert("warning", "Assigned schedule failed!");
    }
  };

  const convertTo24HourFormat = (time) => {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":");
    if (modifier === "PM" && hours !== "12") hours = parseInt(hours, 10) + 12;
    if (modifier === "AM" && hours === "12") hours = "00";
    return `${hours}:${minutes}`;
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
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "100%", maxWidth: "500px", padding: "20px" }}>
        <div
          className="d-flex"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
          }}
        >
          <Icon.ArrowLeft
            size={30}
            style={{ cursor: "pointer", color: "black" }}
            onClick={() => router.push("/admin/create")}
          />
        </div>

        <div className="text-center mt-4">
          <h1 className="mb-4">Assign Schedule</h1>
        </div>

        {/* Alert */}
        {alertShow.show && (
          <Modal
            show={alertShow.show}
            onHide={() => setAlertShow({ ...alertShow, show: false })}
            centered
            backdrop="static"
            keyboard={false}
          >
            <Modal.Body
              style={{
                backgroundColor: "#f0f0f5",
                borderRadius: "12px",
                boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <h5
                style={{
                  color:
                    alertShow.variant === "danger"
                      ? "#d9534f"
                      : alertShow.variant === "warning"
                      ? "#f0ad4e"
                      : "#5cb85c",
                  fontWeight: "bold",
                }}
              >
                {alertShow.message}
              </h5>
            </Modal.Body>
          </Modal>
        )}

        <FormField
          label={"Days"}
          as={"select"}
          value={days}
          onChange={handleSelectionDay}
        >
          <option value="">Select Day</option>
          {!Array.isArray(getDays) || getDays.length === 0 ? (
            <option disabled>No results.</option>
          ) : (
            <>
              {getDays.map((day, index) => (
                <option key={index} value={day.day_id}>
                  {day.day_name}
                </option>
              ))}
            </>
          )}
        </FormField>

        {/* Display Selected Days */}
        <div className="mb-2">
          {selectedDays.map((day) => (
            <Badge
              key={day.day_id}
              pill
              bg="primary"
              className="me-2"
              style={{ cursor: "pointer" }}
              onClick={() => removeDay(day.day_id)}
            >
              {day.day_name} <Icon.X size={12} />
            </Badge>
          ))}
        </div>

        <FormField
          label={"Start Time"}
          type={"time"}
          value={startTime}
          onChange={handleStartTimeChange}
        />

        <FormField
          label={"End Time"}
          type={"time"}
          value={endTime}
          onChange={handleEndTimeChange}
        />

        <FormField
          label={"Select duty hours"}
          as={"select"}
          value={dutyHours}
          onChange={selectedDutyHours}
        >
          <option value="">Select Duty Hours</option>
          {!Array.isArray(getDutyHours) || getDutyHours.length === 0 ? (
            <option disabled>No results.</option>
          ) : (
            getDutyHours.map((hours, index) => (
              <option key={index} value={hours.duty_hours_id}>
                {hours.required_duty_hours} hours
              </option>
            ))
          )}
        </FormField>

        <Button
          variant="primary"
          className="mt-4 w-100"
          onClick={submitAssignSched}
          disabled={
            selectedDays.length === 0 || !startTime || !endTime || !dutyHours
          }
        >
          Submit
        </Button>
      </Card>
    </Container>
  );
};

export default AssignSchedule;
