"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLogout } from "@/components/student/logout";
import { Container, Spinner } from "react-bootstrap";
import SaNavbar from "@/components/student/navbar";
import { useQRCode } from "next-qrcode";

const QRCode = () => {
  const [saId, setSaId] = useState(null);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeData, setQrCodeData] = useState("");
  const logout = useLogout();
  const router = useRouter();

  const { Image } = useQRCode();

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
      retrieveQRCode();
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

  const retrieveQRCode = async () => {
    try {
      const url =
        "http://localhost/nextjs/api/sa-monitoring/studentAssistant.php";

      const jsonData = {
        saId: saId,
      };

      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(jsonData),
          operation: "generateSaQRCode",
        },
      });

      if (response.data.qrcodeData) {
        setQrCodeData(JSON.stringify(response.data.qrcodeData));
        console.log(response.data.qrcodeData);
      } else {
        console.error("Invalid QR code data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
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
          <h1>QR Code</h1>
          <div className="text-center">
            {qrCodeData ? (
              <Image
                text={qrCodeData}
                options={{
                  errorCorrectionLevel: "M",
                  margin: 3,
                  scale: 4,
                  width: 400,
                  color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                  },
                }}
              />
            ) : (
              <p>Loading QR Code...</p>
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default QRCode;
