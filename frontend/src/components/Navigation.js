import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Real Estate App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/properties">Properties</Nav.Link>
            
            {user && user.role === 'seller' && (
              <>
                <Nav.Link as={Link} to="/add-property">Add Property</Nav.Link>
                <Nav.Link as={Link} to="/manage-listings">My Listings</Nav.Link>
              </>
            )}
            
            {user && (
              <Nav.Link as={Link} to="/appointments">Appointments</Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            ) : (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">
                  Welcome, {user.name} ({user.role})
                </span>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 