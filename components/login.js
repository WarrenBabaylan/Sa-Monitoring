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

        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "login.php";


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
                } else if (response.data.role === "student-assistant") {
                    showToast("success", "Login successful!");
                    router.push("/student-assistant/dashboard");
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
                background: "linear-gradient(180deg, #001F3F  0%, #41644A 50%, #F4D793 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)", // Safari support
                padding: "10px",
            }}
        >
            <Container className="d-flex align-items-center justify-content-center vh-100 p-3">
                <Card
                    className="d-flex flex-column flex-md-row shadow-lg rounded-0 w-75"
                    style={{
                        maxWidth: "750px",
                        width: "75%",
                        transition: "all 0.3s ease-in-out",
                    }}
                >
                    <Card className="bg-success text-white p-1 w-100 d-flex flex-column align-items-center justify-content-center rounded-0">
                        <Image
                            src="/images/coc-logo.png"
                            alt="Logo"
                            width={160}
                            height={160}
                            priority
                        />
                        <h4 className="fw-bold text-center mt-2">Cagayan de Oro College</h4>
                        <p className="text-center">
                            PHINMA Education
                            <br />
                            Pro Deo et Humanitate
                        </p>
                    </Card>
                    <Card.Body className="w-90 p-4" style={{ backgroundColor: "#ffffff" }}>
                        <div className="text-center mb-3">
                            <h2 className="text-dark fw-bold">
                                SA <span className="text-dark">Monitoring</span>
                            </h2>
                            <p className="text-muted">Log in to your account</p>
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
                                    className={`form-control text-center ${userCaptcha && parseInt(userCaptcha) !== captchaAnswer
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
                                    variant="link"
                                    onClick={generateCaptcha}
                                    className="ms-2 text-dark"
                                    style={{ background: "none", boxShadow: "none" }}
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
                        </Form>
                    </Card.Body>
                </Card>
                <div
                    style={{
                        position: "absolute",
                        bottom: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        textAlign: "center",
                        width: "100%",
                    }}
                >
                    <p className="text- mb-0">
                        2025[SA Monitoring]Beta. <strong>Developed by ITS Interns 2025. All Rights Reserved.</strong>
                    </p>
                </div>

                <ToastContainer position="top-end" className="p-3">
                    <Toast
                        show={toast.show}
                        onClose={() => setToast({ ...toast, show: false })}
                        delay={5000}
                        autohide
                        bg={toast.variant}
                    >
                        <Toast.Body className="text-white">{toast.message}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Container>
        </div>
    );
};

export default Login;