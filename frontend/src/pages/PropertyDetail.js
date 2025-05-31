import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentError, setAppointmentError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`/api/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      setAppointmentError('');
      const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      
      await axios.post('/api/appointments', {
        property: property._id,
        seller: property.seller._id,
        appointmentDate: dateTime
      });

      setShowAppointmentModal(false);
      navigate('/appointments');
    } catch (err) {
      setAppointmentError(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!property) return <Alert variant="info">Property not found</Alert>;

  return (
    <Container>
      <Card className="mb-4">
        <Card.Body>
          <Row>
            {/* Image Gallery */}
            <Col md={6}>
              <div className="position-relative">
                <img
                  src={property.images[currentImageIndex] || '/placeholder-house.jpg'}
                  alt={`Property ${currentImageIndex + 1}`}
                  className="img-fluid rounded"
                  style={{ height: '400px', width: '100%', objectFit: 'cover' }}
                />
                {property.images.length > 1 && (
                  <div className="d-flex justify-content-between position-absolute w-100" style={{ bottom: '50%' }}>
                    <Button
                      variant="light"
                      onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : property.images.length - 1))}
                    >
                      ←
                    </Button>
                    <Button
                      variant="light"
                      onClick={() => setCurrentImageIndex(prev => (prev < property.images.length - 1 ? prev + 1 : 0))}
                    >
                      →
                    </Button>
                  </div>
                )}
                <div className="text-center mt-2">
                  {property.images.map((_, index) => (
                    <Button
                      key={index}
                      variant={index === currentImageIndex ? "primary" : "light"}
                      size="sm"
                      className="mx-1"
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      •
                    </Button>
                  ))}
                </div>
              </div>
            </Col>

            {/* Property Details */}
            <Col md={6}>
              <h2>{property.title}</h2>
              <h3 className="text-primary mb-4">{formatPrice(property.price)}</h3>
              
              <h5>Location</h5>
              <p>
                {property.location.address}<br />
                {property.location.city}, {property.location.state}
              </p>

              <h5>Property Details</h5>
              <Row className="mb-3">
                <Col xs={6}>
                  <strong>Type:</strong> {property.type}
                </Col>
                <Col xs={6}>
                  <strong>Year Built:</strong> {property.features.yearBuilt}
                </Col>
                <Col xs={6}>
                  <strong>Bedrooms:</strong> {property.features.bedrooms}
                </Col>
                <Col xs={6}>
                  <strong>Bathrooms:</strong> {property.features.bathrooms}
                </Col>
                <Col xs={12}>
                  <strong>Area:</strong> {property.features.area} sq ft
                </Col>
              </Row>

              <h5>Description</h5>
              <p>{property.description}</p>

              <h5>Contact</h5>
              <p>
                Seller: {property.seller.name}<br />
                Email: {property.seller.email}
              </p>

              {user && user.role === 'buyer' && (
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => setShowAppointmentModal(true)}
                >
                  Book Appointment
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Appointment Booking Modal */}
      <Modal show={showAppointmentModal} onHide={() => setShowAppointmentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {appointmentError && <Alert variant="danger">{appointmentError}</Alert>}
          <Form onSubmit={handleAppointmentSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">
              Book Appointment
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PropertyDetail; 