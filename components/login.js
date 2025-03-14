"use client";
import axios from "axios";
import Image from "next/image";
import FormField from "./form";
import { useRouter } from "next/navigation";
import { AiOutlineReload } from "react-icons/ai";
import { useState, useRef, useEffect } from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Form,
    Button,
    Toast,
    Spinner,
    ToastContainer,
    InputGroup
} from "react-bootstrap";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [captchaAnswer, setCaptchaAnswer] = useState("");
    const [userCaptcha, setUserCaptcha] = useState("");
    const router = useRouter();

    const [toast, setToast] = useState({
        show: false,
        variant: "success",
        message: "",
    });

    const showToast = (variant, message) => {
        setToast({ show: true, variant, message });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
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
        if (!username && !password && !userCaptcha) {
            showToast("danger", "Username, password, and CAPTCHA are required.");
            return;
        } else if (!username) {
            showToast("warning", "Username is required");
            return;
        } else if (!password) {
            showToast("warning", "Password is required");
            return;
        } else if (!userCaptcha) {
            showToast("danger", "CAPTCHA is required");
            return;
        }

        if (parseInt(userCaptcha) !== captchaAnswer) {
            return;
        }

        const url = "http://localhost/nextjs/api/sa-monitoring/login.php";

        const jsonData = {
            username: username,
            password: password,
            num1: num1,
            num2: num2,
            captcha_answer: userCaptcha,
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
                withCredentials: true,
            });

            if (response.data.status === "success") {
                if (response.data.role === "admin") {
                    showToast("success", "Login successful!");
                    router.push("/admin/dashboard");
                    console.log(response.data);
                } else if (response.data.role === "student-assistant") {
                    showToast("success", "Login successful!");
                    router.push("/student-assistant/dashboard");
                    console.log(response.data);
                }
            } else {
                if (response.data.message === "Username is incorrect") {
                    showToast("warning", "Username is incorrect!");
                } else if (response.data.message === "Password is incorrect") {
                    showToast("warning", "Password is incorrect!");
                } else {
                    showToast("danger", response.data.message);
                }
            }
        } catch (error) {
            showToast("danger", "Network error. Please try again.");
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
            <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, #d4f5e9 0%, #7ecb96 40%, #4b9654 70%, #2e5e3e 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                padding: "10px",
            }}
            
            
            
            >
                <Container className="d-flex align-items-center justify-content-center vh-100 p-3">
        <Card
            className="shadow-lg rounded-0 w-85"
            style={{
                maxWidth: "750px",
                width: "85%",
                transition: "all 0.3s ease-in-out",
                background: "rgba(255, 255, 255, 0.2)", // Glass effect
                backdropFilter: "blur(10px)", // Blur background
                border: "1px solid rgba(255, 255, 255, 0.3)", // Light border
            }}
        >
            <Row className="g-0">
                <Col md={5} sm={12} className="bg-success text-white d-flex flex-column align-items-center justify-content-center p-4 p-sm-1">
                    <Image src="/images/coc-logo.png" alt="Logo" width={150} height={160} priority />
                    <h4 className="fw-bold text-center mt-2 fs-5">Cagayan de Oro College</h4>
                    <p className="text-center mb-0 fs-6">PHINMA Education</p>
                    <small className="fs-7">Pro Deo et Humanitate</small>
                </Col>

                <Col md={7} sm={12} className="p-4 p-sm-3">
                    <div className="text-center mb-3">
                        <h2 className="fw-bold" style={{ color: "#4CAF50" }}>
                            SA <span className="text-dark">Monitoring</span>
                        </h2>
                        <p className="text-muted fs-6">Log in to your account</p>
                    </div>

                    <Form onKeyDown={handleKeyDown}>
        <FormField
            label={"Username"}
            type={"text"}
            placeholder={"Enter your username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus={true}
            style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "16px",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                transition: "0.3s ease-in-out",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #4CAF50")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
        />

        <FormField
            label={"Password"}
            type={"password"}
            placeholder={"Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            ref={passwordRef}
            style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "16px",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                transition: "0.3s ease-in-out",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #4CAF50")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
        />

        <div className="d-flex align-items-center justify-content-between my-2">
            <input 
                type="text" 
                className="form-control text-center"
                value={num1} 
                readOnly
                style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    border: "1px solid #aaa",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "#f8f8f8",
                }}
            />
            <span className="mx-2">+</span>
            <input 
                type="text" 
                className="form-control text-center"
                value={num2} 
                readOnly
                style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    border: "1px solid #aaa",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "#f8f8f8",
                }}
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
                style={{
                    fontSize: "16px",
                    padding: "12px",
                    border: "1px solid #aaa",
                    borderRadius: "8px",
                    transition: "0.3s ease-in-out",
                }}
            />
            <Button
                variant="link"
                onClick={generateCaptcha}
                className="ms-2 text-dark"
                style={{ background: "none", boxShadow: "none" }}
            >
                <AiOutlineReload />
            </Button>
        </div>

        <Button
            onClick={login}
            className="w-100 mt-2 mb-2"
            disabled={loading}
            style={{
                backgroundColor: "#4CAF50", 
                border: "none",
                color: "white",
                fontSize: "18px",
                fontWeight: "600",
                padding: "14px",
                borderRadius: "10px",
                transition: "0.3s ease-in-out",
                boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.15)",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#66BB6A")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
            {loading ? (
                <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    Loading...
                </>
            ) : (
                "Login"
            )}
        </Button>
    </Form>

                </Col>
            </Row>
        </Card>

        <ToastContainer position="top-end" className="p-3">
            <Toast show={toast.show} onClose={() => setToast({ ...toast, show: false })} delay={5000} autohide bg={toast.variant}>
                <Toast.Body className="text-white">{toast.message}</Toast.Body>
            </Toast>
        </ToastContainer>
    </Container>

            </div>
    );
};

export default Login;
