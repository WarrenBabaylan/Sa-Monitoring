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
} from "react-bootstrap";
import ReusableModal from "@/components/modal";
import { useLogout } from "@/components/admin/logout";
import AdminNavbar from "@/components/admin/navbar";
import FormField from "@/components/form";

const ManageAdmin = () => {
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

    if (!storedAdminId) {
      router.push("/");
      return;
    }

    setAdminId(storedAdminId);
    setAdminFirstname(sessionStorage.getItem("firstname"));
    setAdminLastname(sessionStorage.getItem("lastname"));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (adminId !== null) {
      retrieveAdmin();
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

  //------------------- Modal --------------------------//
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const [getAdmin, setGetAdmin] = useState([]);

  //--------------- Create new Sa Account ----------------//
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

  const retrieveAdmin = async () => {
    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    setLoading(true);
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: "displayAdmin",
        },
      });
      setGetAdmin(response.data);
    } catch (error) {
      setGetAdmin(null);
    } finally {
      setLoading(false);
    }
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
      showAlert("warning", "username is required!");
      return;
    }

    const url = "http://localhost/nextjs/api/sa-monitoring/admin.php";

    setPassword(lastname);
    const jsonData = {
      firstname: firstname,
      lastname: lastname,
      username: username,
      password: lastname.toLowerCase(),
      adminId: adminId,
    };

    console.log(jsonData);

    const formData = new FormData();
    formData.append("operation", "createAdmin");
    formData.append("json", JSON.stringify(jsonData));

    setLoading(true);
    try {
      const response = await axios({
        url: url,
        method: "POST",
        data: formData,
      });

      if (response.data == 1) {
        showAlert("success", "New admin added successfully!");
        setFirstname("");
        setLastname("");
        setUsername("");
        setPassword("");
        retrieveAdmin();
      } else if (response.data == 2) {
        showAlert("danger", "Username already exists!");
      } else {
        showAlert("warning", "New admin add failed!");
      }
    } catch (error) {
      showAlert("danger", "Network error. Please try again.");
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

          <h3>Manage Admin</h3>

          <Button
            variant="primary"
            className="mb-1"
            onClick={() => {
              handleShowModal();
            }}
          >
            Add Admin
          </Button>

          <Table responsive bordered hover className="mb-4 text-center">
            <thead className="bg-primary text-white">
              <tr>
                <th>#</th>
                <th>Firstname</th>
                <th>Lastname</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading data, please wait...
                  </td>
                </tr>
              ) : !Array.isArray(getAdmin) || getAdmin.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-danger fw-bold">
                    No data available. Please wait or check your connection.
                  </td>
                </tr>
              ) : (
                getAdmin.map((admin, index) => (
                  <tr key={index} className="align-middle">
                    <td>{index + 1}</td>
                    <td>{admin.firstname}</td>
                    <td>{admin.lastname}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Container>
      </div>

      {/* Add student assistant */}
      <ReusableModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        title={"Manage Admin"}
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
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </Form>
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
                submit();
                handleCloseModal();
              }}
              disabled={loading}
            >
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

export default ManageAdmin;
