import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SellerDashboard = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.role === 'seller') {
            fetchProperties();
        } else {
            navigate('/login');
        }
    }, [user]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/properties/seller/listings');
            setProperties(response.data);
        } catch (error) {
            console.error('Error fetching properties:', error);
            setError('Failed to fetch your properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/properties/${propertyToDelete._id}`);
            setProperties(properties.filter(p => p._id !== propertyToDelete._id));
            setShowDeleteModal(false);
            setPropertyToDelete(null);
        } catch (error) {
            console.error('Error deleting property:', error);
            setError('Failed to delete property');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    };

    if (!user || user.role !== 'seller') {
        navigate('/login');
        return null;
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Properties</h2>
                <div>
                    <Button
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => navigate('/appointments')}
                    >
                        View Enquiries
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/properties/create')}
                    >
                        Add New Property
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center">Loading...</div>
            ) : properties.length === 0 ? (
                <Card>
                    <Card.Body className="text-center">
                        <h4>No properties found</h4>
                        <p>Start by adding your first property</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/properties/create')}
                        >
                            Add Property
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {properties.map(property => (
                        <Col key={property._id}>
                            <Card className="h-100">
                                {property.imageUrls && property.imageUrls.length > 0 && (
                                    <Card.Img
                                        variant="top"
                                        src={property.imageUrls[0]}
                                        alt={property.title}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{property.title}</Card.Title>
                                    <Card.Text>
                                        <div className="mb-2">
                                            <strong>Location:</strong> {property.location}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Price:</strong> {formatPrice(property.price)}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Type:</strong> {property.propertyType}
                                        </div>
                                        <div>
                                            <strong>Status:</strong>{' '}
                                            <span className={`badge bg-${property.status === 'available' ? 'success' : 'secondary'}`}>
                                                {property.status}
                                            </span>
                                        </div>
                                    </Card.Text>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="primary"
                                            className="flex-grow-1"
                                            onClick={() => navigate(`/properties/${property._id}/edit`)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => {
                                                setPropertyToDelete(property);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            Delete
                                        </Button>
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
                    Are you sure you want to delete the property "{propertyToDelete?.title}"? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SellerDashboard; 