"use client";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import FormField from "./form";
import { AiOutlineReload } from "react-icons/ai";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const router = useRouter();

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

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 50) + 1;
    const n2 = Math.floor(Math.random() * 50) + 1;
    setNum1(n1);
    setNum2(n2);
    setCaptchaAnswer(n1 + n2);
    setUserCaptcha("");
  };

  const login = async () => {
    if (!username && !password) {
      showAlert("danger", "Username and Password are required");
      return;
    } else if (!username) {
      showAlert("warning", "Username is required");
      return;
    } else if (!password) {
      showAlert("warning", "Password is required");
      return;
    }

    if (!userCaptcha) {
      showAlert("danger", "CAPTCHA is required");
      return;
    }

    if (parseInt(userCaptcha) !== captchaAnswer) {
      return;
    }

    const url = "http://localhost/nextjs/api/sa-monitoring/login.php";

    const jsonData = {
      username: username,
      password: password,
    };

    const formData = new FormData();
    formData.append("operation", "login");
    formData.append("json", JSON.stringify(jsonData));

    setLoading(true);
    try {
      const response = await axios({
        url: url,
        method: "POST",
        data: formData,
      });

      if (response.data.role) {
        const { role } = response.data;
        let params = new URLSearchParams();
        if (role === "admin") {
          showAlert("success", "Login successful");
          sessionStorage.setItem("adminId", response.data.admin_id);
          sessionStorage.setItem("firstname", response.data.firstname);
          sessionStorage.setItem("lastname", response.data.lastname);
          router.push(`/admin/dashboard ${params}`);
        } else if (role === "student-assistant") {
          showAlert("success", "Login successful");
          sessionStorage.setItem("saId", response.data.sa_id);
          sessionStorage.setItem("firstname", response.data.firstname);
          sessionStorage.setItem("lastname", response.data.lastname);
          router.push(`/student-assistant/dashboard ${params}`);
        }
      } else {
        showAlert("warning", "Invalid username or password");
      }
    } catch (error) {
      showAlert("danger", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (document.activeElement === usernameRef.current) {
        passwordRef.current.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (document.activeElement === passwordRef.current) {
        usernameRef.current.focus();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      login();
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100">
      <Card
        style={{ width: "30rem" }}
        className="shadow-lg p-4 rounded text-black"
      >
        <Card.Body style={{ backgroundColor: "#ffffff" }}>
          <div className="text-center mb-3">
            <h2 className="text-[#1e0e4b] font-bold">
              SA <span className="text-[#7747ff]">Monitoring</span>
            </h2>
            <p className="text-sm text-[#1e0e4b]">Log in to your account</p>
          </div>
          <Form onKeyDown={handleKeyDown}>
            <FormField
              label={"Username"}
              type={"text"}
              placeholder={"enter username..."}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              autoFocus={true}
            />

            <FormField
              label={"Password"}
              type={"password"}
              placeholder={"enter password..."}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              ref={passwordRef}
            />

            <div className="d-flex align-items-center justify-content-between my-2">
              <input
                type="text"
                className="form-control text-center"
                value={num1}
                readOnly
              />
              <span className="mx-2">+</span>
              <input
                type="text"
                className="form-control text-center"
                value={num2}
                readOnly
              />
              <span className="mx-2">=</span>
              <input
                type="text"
                className={`form-control text-center ${
                  userCaptcha && parseInt(userCaptcha) !== captchaAnswer
                    ? "border border-danger text-danger"
                    : userCaptcha && parseInt(userCaptcha) === captchaAnswer
                    ? "border border-success text-success"
                    : ""
                }`}
                value={userCaptcha}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setUserCaptcha(value);
                  }
                }}
              />

              <Button
                variant="light"
                onClick={generateCaptcha}
                className="ms-2"
              >
                <AiOutlineReload />
              </Button>
            </div>

            {userCaptcha && parseInt(userCaptcha) !== captchaAnswer && (
              <div className="text-danger text-start mt-1">
                Please fill correct value
              </div>
            )}

            <Button
              variant="primary"
              onClick={login}
              className="w-100 mt-2 mb-2 bg-[#7747ff] text-white"
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
                "Login"
              )}
            </Button>

            {alertShow.show && (
              <Alert
                variant={alertShow.variant}
                onClose={() => setAlertShow({ ...alertShow, show: false })}
                dismissible
              >
                {alertShow.message}
              </Alert>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
