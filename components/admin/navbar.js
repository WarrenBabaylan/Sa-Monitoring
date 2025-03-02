"use client";
import * as Icon from "react-bootstrap-icons";
import { Navbar, Nav, Button } from "react-bootstrap";

const AdminNavbar = ({
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
                <Navbar.Brand href="#">Admin Page</Navbar.Brand>
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
                    <Nav.Link href="/admin/dashboard" className="text-light">
                        <Icon.Grid className="me-2" /> Dashboard
                    </Nav.Link>
                    <Nav.Link href="/admin/duty_hours" className="text-light">
                        <Icon.Clock className="me-2" /> Duty Hours
                    </Nav.Link>
                    <Nav.Link href="/admin/create" className="text-light">
                        <Icon.PersonPlus className="me-2" /> Student Assistant
                    </Nav.Link>
                    <Nav.Link href="/admin/attendance" className="text-light">
                        <Icon.ClipboardCheck className="me-2" /> Attendance
                    </Nav.Link>
                    <Nav.Link href="/admin/leave_approval" className="text-light">
                        <Icon.Check2Circle className="me-2" /> Leave Approval
                    </Nav.Link>
                    <Nav.Link href="/admin/add_admin" className="text-light">
                        <Icon.GearFill className="me-2 text-light" /> Manage Admin
                    </Nav.Link>
                    <Nav.Link href="/admin/logs" className="text-light">
                        <Icon.JournalText className="me-2" /> Activity Logs
                    </Nav.Link>
                    <Nav.Link onClick={logout} className="text-light">
                        <Icon.BoxArrowDownRight className="me-2" /> Logout
                    </Nav.Link>
                </Nav>
            </div>
        </>
    );
};

export default AdminNavbar;