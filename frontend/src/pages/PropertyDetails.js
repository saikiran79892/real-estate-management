import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [appointmentData, setAppointmentData] = useState({
        dateTime: '',
        message: ''
    });

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/properties/${id}`);
            setProperty(response.data);
        } catch (err) {
            setError('Failed to fetch property details');
            console.error('Error fetching property:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/appointments', {
                property: id,
                seller: property.seller._id,
                appointmentDate: new Date(appointmentData.dateTime).toISOString(),
                message: appointmentData.message || ''
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                setShowAppointmentModal(false);
                setAppointmentData({ dateTime: '', message: '' });
                alert('Appointment request sent successfully!');
            }
        } catch (err) {
            console.error('Error creating appointment:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || 'Failed to create appointment. Please try again.';
            alert(errorMessage);
        }
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!property) return null;

    return (
        <Container className="py-4">
            <Row>
                <Col md={8}>
                    <h2>{property.title}</h2>
                    <p className="text-muted">{property.location}</p>
                    
                    <div className="mb-4">
                        {property.imageUrls && property.imageUrls.length > 0 ? (
                            <img
                                src={property.imageUrls[0]}
                                alt={property.title}
                                className="img-fluid rounded"
                                style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="bg-light rounded" style={{ height: '400px' }} />
                        )}
                    </div>

                    <Card className="mb-4">
                        <Card.Body>
                            <h4>Description</h4>
                            <p>{property.description}</p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h4>Property Details</h4>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Type:</strong> {property.propertyType}</p>
                                    <p><strong>Price:</strong> ${property.price.toLocaleString()}</p>
                                    <p><strong>Area:</strong> {property.area} sq ft</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
                                    <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
                                    <p><strong>Status:</strong> {property.status}</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <h4>Contact Information</h4>
                            <p><strong>Seller:</strong> {property.seller.name}</p>
                            <p><strong>Email:</strong> {property.seller.email}</p>
                            
                            {user?.role === 'buyer' && (
                                <Button
                                    variant="primary"
                                    className="w-100 mt-3"
                                    onClick={() => {
                                        if (!user) {
                                            localStorage.setItem('redirectAfterLogin', window.location.pathname);
                                            navigate('/login');
                                        } else {
                                            setShowAppointmentModal(true);
                                        }
                                    }}
                                >
                                    Book Viewing Appointment
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Appointment Booking Modal */}
            <Modal show={showAppointmentModal} onHide={() => setShowAppointmentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Book Viewing Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAppointmentSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Date and Time</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                required
                                value={appointmentData.dateTime}
                                onChange={(e) => setAppointmentData({
                                    ...appointmentData,
                                    dateTime: e.target.value
                                })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Message (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={appointmentData.message}
                                onChange={(e) => setAppointmentData({
                                    ...appointmentData,
                                    message: e.target.value
                                })}
                                placeholder="Add any additional information or questions"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Request Appointment
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default PropertyDetails; 