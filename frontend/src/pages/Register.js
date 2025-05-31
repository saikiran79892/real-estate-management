import React, { useState } from 'react';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'buyer'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Validate password strength
            if (formData.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registrationData } = formData;

            const response = await axios.post('http://localhost:5000/api/auth/register', registrationData);
            
            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Redirect based on role
            if (response.data.user.role === 'seller') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={6}>
                    <h2 className="text-center mb-4">Register</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="buyer">Buyer</option>
                                <option value="seller">Seller</option>
                            </Form.Select>
                        </Form.Group>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100 mb-3"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </Button>

                        <div className="text-center">
                            Already have an account? <Link to="/login">Login</Link>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Register; 