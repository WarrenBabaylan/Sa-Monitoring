import Link from "next/link";
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
                    <Link href="/admin/dashboard" passHref legacyBehavior>
                        <Nav.Link className="text-light">
                            <Icon.Grid className="me-2" /> Dashboard
                        </Nav.Link>
                    </Link>
                    <Link href="/admin/duty_hours" passHref legacyBehavior>
                        <Nav.Link className="text-light">
                            <Icon.Clock className="me-2" /> Duty Hours
                        </Nav.Link>
                    </Link>
                    <Link href="/admin/create" passHref legacyBehavior>
                        <Nav.Link className="text-light">
                            <Icon.PersonPlus className="me-2" /> Student Assistant
                        </Nav.Link>
                    </Link>
                    <Link href="/admin/attendance" passHref legacyBehavior>
                        <Nav.Link className="text-light">
                            <Icon.ClipboardCheck className="me-2" /> Attendance
                        </Nav.Link>
                    </Link>
                    <Link href="/admin/leave_approval" passHref legacyBehavior>
                        <Nav.Link className="text-light">
                            <Icon.Check2Circle className="me-2" /> Leave Approval
                        </Nav.Link>
                    </Link>
                    <Link href="/admin/add_admin" passHref legacyBehavior>
                        <Nav.Link className="text-light">
                            <Icon.GearFill className="me-2" /> Manage Admin
                        </Nav.Link>
                    </Link>
                    <Link href="/admin/logs" passHref legacyBehavior>
                        <Nav.Link className="text-light">
                            <Icon.JournalText className="me-2" /> Activity Logs
                        </Nav.Link>
                    </Link>
                    <Nav.Link onClick={logout} className="text-light" role="button">
                        <Icon.BoxArrowDownRight className="me-2" /> Logout
                    </Nav.Link>
                </Nav>
            </div>
        </>
    );
};

export default AdminNavbar;