"use client";
import * as Icon from "react-bootstrap-icons";
import { Navbar, Nav, Button } from "react-bootstrap";

const SaNavbar = ({
  firstname,
  lastname,
  isSidebarVisible,
  toggleSidebar,
  logout,
}) => {
  return (
    <>
      {/* Navbar */}
      <Navbar
        expand="lg"
        variant="dark"
        className="px-3 fixed-top"
        style={{ backgroundColor: "#343a40" }}
      >
        <Navbar.Brand href="#">Student Assistant</Navbar.Brand>
        <Button
          variant="outline-light"
          onClick={toggleSidebar}
          className="me-2"
          aria-label="Toggle Sidebar"
        >
          {isSidebarVisible ? <Icon.List size={20} /> : <Icon.X size={20} />}
        </Button>
        <h6 className="ms-auto text-light mb-0">
          {firstname} {lastname}
        </h6>
      </Navbar>

      {/* Sidebar */}
      <div
        className="sidebar bg-dark"
        style={{
          height: "100vh",
          width: isSidebarVisible ? "250px" : "0",
          overflow: "hidden",
          transition: "width 0.3s ease",
          position: "fixed",
          top: "56px",
          left: "0",
        }}
      >
        <Nav className="flex-column p-3">
          <Nav.Link href="/student-assistant/dashboard" className="text-light">
            <Icon.Grid className="me-2" /> Dashboard
          </Nav.Link>
          <Nav.Link href="/student-assistant/track-time" className="text-light">
            <Icon.Stopwatch className="me-2" /> Track Time
          </Nav.Link>
          <Nav.Link href="apply-leave" className="text-light">
            <Icon.FileEarmarkText className="me-2" /> Apply Leave
          </Nav.Link>
          <Nav.Link href="qrcode" className="text-light">
            <Icon.QrCode className="me-2" /> QR Code
          </Nav.Link>
          <Nav.Link onClick={logout} className="text-light">
            <Icon.BoxArrowDownRight className="me-2" /> Logout
          </Nav.Link>
        </Nav>
      </div>
    </>
  );
};

export default SaNavbar;
