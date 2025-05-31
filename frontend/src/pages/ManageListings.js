import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ManageListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/properties/seller/listings');
      setProperties(response.data);
    } catch (error) {
      setError('Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (property) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/properties/${selectedProperty._id}`);
      setProperties(properties.filter(p => p._id !== selectedProperty._id));
      setShowDeleteModal(false);
    } catch (error) {
      setError('Failed to delete property');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Properties</h2>
        <Link to="/add-property">
          <Button variant="primary">Add New Property</Button>
        </Link>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {properties.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p>You haven't listed any properties yet.</p>
            <Link to="/add-property">
              <Button variant="primary">Add Your First Property</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {properties.map(property => (
            <Col key={property._id} md={6} lg={4} className="mb-4">
              <Card>
                <Card.Img
                  variant="top"
                  src={property.images[0] || '/placeholder-house.jpg'}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title>{property.title}</Card.Title>
                  <Card.Text>
                    <strong>Price:</strong> {formatPrice(property.price)}<br />
                    <strong>Type:</strong> {property.type}<br />
                    <strong>Location:</strong> {property.location.city}, {property.location.state}<br />
                    <strong>Status:</strong> <span className={`text-${property.status === 'available' ? 'success' : 'warning'}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Link to={`/properties/${property._id}`}>
                      <Button variant="outline-primary">View</Button>
                    </Link>
                    <div>
                      <Link to={`/edit-property/${property._id}`} className="me-2">
                        <Button variant="outline-secondary">Edit</Button>
                      </Link>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(property)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedProperty?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Property
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageListings; 