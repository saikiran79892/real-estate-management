import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navbarStyle = {
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const brandStyle = {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
    };

    const navLinkStyle = {
        color: '#ffffff !important',
        fontWeight: '500',
        padding: '0.5rem 1rem',
        transition: 'all 0.3s ease',
        borderRadius: '4px',
        margin: '0 5px'
    };

    const activeNavLinkStyle = {
        ...navLinkStyle,
        backgroundColor: 'rgba(255,255,255,0.1)'
    };

    const dropdownStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: 'none',
        padding: '8px 0'
    };

    return (
        <Navbar expand="lg" style={navbarStyle} className="py-2">
            <Container>
                <Navbar.Brand as={Link} to="/" style={brandStyle}>
                    ESTATE-CONNECT
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link 
                            as={Link} 
                            to={user?.role === 'seller' ? "/dashboard" : "/"} 
                            style={navLinkStyle}
                            className="nav-link-hover"
                        >
                            {user?.role === 'seller' ? "Dashboard" : "Home"}
                        </Nav.Link>
                        {(!user || user.role !== 'seller') && (
                            <Nav.Link 
                                as={Link} 
                                to="/properties" 
                                style={navLinkStyle}
                                className="nav-link-hover"
                            >
                                Properties
                            </Nav.Link>
                        )}
                        {user && (
                            <Nav.Link 
                                as={Link} 
                                to="/appointments" 
                                style={navLinkStyle}
                                className="nav-link-hover"
                            >
                                Appointments
                            </Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        {user ? (
                            <>
                                <NavDropdown 
                                    title={
                                        <span style={{ color: '#ffffff' }}>
                                            {user.name || 'Profile'}
                                        </span>
                                    }
                                    id="basic-nav-dropdown"
                                    align="end"
                                >
                                    {user.role === 'buyer' && (
                                        <NavDropdown.Item 
                                            as={Link} 
                                            to="/appointments"
                                            className="dropdown-item-hover"
                                        >
                                            My Appointments
                                        </NavDropdown.Item>
                                    )}
                                    <NavDropdown.Item 
                                        onClick={handleLogout}
                                        className="text-danger dropdown-item-hover"
                                    >
                                        Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to="/login" 
                                    style={navLinkStyle}
                                    className="nav-link-hover"
                                >
                                    Login
                                </Nav.Link>
                                <Nav.Link 
                                    as={Link} 
                                    to="/register" 
                                    style={{
                                        ...navLinkStyle,
                                        backgroundColor: '#ffffff',
                                        color: '#2193b0 !important',
                                        fontWeight: '600'
                                    }}
                                    className="nav-link-hover"
                                >
                                    Register
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;

// Add this CSS to your global styles or create a new CSS file
const styles = `
.nav-link-hover:hover {
    background-color: rgba(255,255,255,0.2) !important;
    transform: translateY(-1px);
}

.dropdown-item-hover:hover {
    background-color: #f8f9fa !important;
    color: #2193b0 !important;
}

.navbar-toggler {
    border-color: rgba(255,255,255,0.5) !important;
}

.navbar-toggler-icon {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.75%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
}
`;

// Create a style element and append it to the document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet); 