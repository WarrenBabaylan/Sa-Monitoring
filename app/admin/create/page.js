"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Button,
  Form,
  Modal,
  Spinner,
  Table,
  Card,
} from "react-bootstrap";
import ReusableModal from "@/components/modal";
import { useLogout } from "@/components/admin/logout";
import AdminNavbar from "@/components/admin/navbar";
import FormField from "@/components/form";

const Create = () => {
  const [adminId, setAdminId] = useState(null);
  const [adminFirstname, setAdminFirstname] = useState(null);
  const [adminLastname, setAdminLastname] = useState(null);
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
      setAdminFirstname(storedFirstname);
      setAdminLastname(storedLastname);
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (adminId !== null) {
      retrieveAllSa();
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

  const [saId, setSaId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [getAllSa, setGetAllSa] = useState([]);
  const [getSaById, setGetSaById] = useState([]);

  //------------------- Modal --------------------------//
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  //--------------- Create new Sa Account -----------------//
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [alertShow, setAlertShow] = useState({
    show: false,
    variant: "success",
    message: "",
  });

  const showAlert = (variant, message) => {
    setAlertShow({ show: true, variant, message });
    setTimeout(() => {
      setAlertShow((prev) => ({ ...prev, show: false }));
    }, 900);
  };

  const retrieveAllSa = async () => {
    //const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";
    const url = "http://192.168.1.48/nextjs/api/sa-monitoring/admin.php";

    const response = await axios.get(url, {
      params: {
        json: JSON.stringify({}),
        operation: "displayAllSa",
      },
    });
    setGetAllSa(response.data);
  };

  const retrieveSaById = async (saId) => {
    //const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";
    const url = "http://192.168.1.48/nextjs/api/sa-monitoring/admin.php";

    const jsonData = {
      saId: saId,
    };

    const response = await axios.get(url, {
      params: {
        json: JSON.stringify(jsonData),
        operation: "displayAllSa",
      },
    });
    setGetSaById(response.data);
    const student = response.data[0];
    setSaId(student.sa_id);
  };

  const showAssignSched = (saId) => {
    retrieveSaById(saId);
    router.push(`/admin/create/assign?saId=${saId}`);
  };

  const submit = async () => {
    if (!firstname && !lastname && !username) {
      showAlert("danger", "Please fill up all fields!");
      return;
    } else if (!firstname) {
      showAlert("warning", "Firstname is required!");
      return;
    } else if (!lastname) {
      showAlert("warning", "Lastname is required!");
      return;
    } else if (!username) {
      showAlert("warning", "Username is required!");
      return;
    }

    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    setPassword(lastname);
    const jsonData = {
      firstname: firstname,
      lastname: lastname,
      username: username,
      password: lastname.toLowerCase(),
    };

    const formData = new FormData();
    formData.append("operation", "createSaAccount");
    formData.append("json", JSON.stringify(jsonData));

    setLoading(true);
    try {
      const response = await axios({
        url: url,
        method: "POST",
        data: formData,
      });

      if (response.data == 1) {
        showAlert("success", "Account created successfully!");
        setFirstname("");
        setLastname("");
        setUsername("");
        setPassword("");
        retrieveAllSa();
      } else if (response.data == 2) {
        showAlert("danger", "Username already exists!");
      } else {
        showAlert("warning", "Account creation failed!");
      }
    } catch (error) {
      showAlert("danger", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSa = getAllSa.filter((sa) =>
    sa.sa_fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        firstname={adminFirstname}
        lastname={adminLastname}
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
        {/* Main Content */}
        <Container
          fluid
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            marginTop: "56px",
          }}
        >
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

          <h3>Student Assistant</h3>

          <Button
            variant="primary"
            className="mb-1"
            onClick={() => {
              handleShowModal();
            }}
          >
            Create
          </Button>

          <Card className="shadow rounded-3 mt-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Student Assistant Schedule</h5>
            </Card.Header>
            <Card.Body>
              <Form.Control
                type="search"
                placeholder="Search student assistant"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-3"
              />
              <Table responsive striped bordered hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Student Assistant</th>
                    <th>Day Schedule</th>
                    <th>Time Schedule</th>
                    <th>Required Duty Hours</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSa.map((sa, index) => (
                    <tr key={index}>
                      <td>{sa.sa_fullname}</td>
                      <td>{sa.day_names}</td>
                      <td>{sa.time_schedule}</td>
                      <td>{sa.required_duty_hours}</td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          className="px-3"
                          onClick={() => showAssignSched(sa.sa_id)}
                        >
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Add student assistant */}
      <ReusableModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        title={"Add Student Assistant"}
        bodyContent={
          <>
            <Form
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
            >
              <FormField
                label={"Firstname"}
                type={"text"}
                placeholder={"enter firstname..."}
                value={firstname}
                onChange={(e) => {
                  setFirstname(e.target.value);
                }}
              />

              <FormField
                label={"Lastname"}
                type={"text"}
                placeholder={"enter lastname..."}
                value={lastname}
                onChange={(e) => {
                  setLastname(e.target.value);
                }}
              />

              <FormField
                label={"Username"}
                type={"text"}
                placeholder={"enter username..."}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />

              <FormField
                label={"Password"}
                type={"text"}
                value={password}
                disabled={true}
              />
            </Form>
          </>
        }
        footerContent={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={submit} disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  Loading...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </>
        }
      />
    </>
  );
};

export default Create;
