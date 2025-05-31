import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Row, Col, Button, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            const endpoint = user?.role === 'seller' ? '/seller' : '/buyer';
            const response = await axios.get(`http://localhost:5000/api/appointments${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            setDeleteError('');
            const token = localStorage.getItem('token');
            
            if (!selectedAppointment?._id) {
                throw new Error('No appointment selected for deletion');
            }

            await axios.delete(`http://localhost:5000/api/appointments/${selectedAppointment._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setAppointments(appointments.filter(app => app._id !== selectedAppointment._id));
            setShowDeleteModal(false);
            setSelectedAppointment(null);
        } catch (error) {
            console.error('Error deleting appointment:', error);
            setDeleteError(error.response?.data?.message || 'Failed to delete appointment. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'confirmed':
                return 'success';
            case 'rejected':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const handleShowDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleShowDeleteConfirm = (appointment) => {
        setDeleteError('');
        setSelectedAppointment(appointment);
        setShowDeleteModal(true);
    };

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">My Appointments</h2>
            
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}
            
            {appointments.length === 0 ? (
                <Card className="text-center p-5">
                    <Card.Body>
                        <h4>No appointments found</h4>
                        <div>You haven't made any appointments yet.</div>
                    </Card.Body>
                </Card>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {appointments.map(appointment => (
                        <Col key={appointment._id}>
                            <Card className="h-100">
                                {appointment.property?.imageUrls?.[0] && (
                                    <Card.Img
                                        variant="top"
                                        src={appointment.property.imageUrls[0]}
                                        alt={appointment.property.title}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{appointment.property?.title}</Card.Title>
                                    <Card.Text as="div">
                                        <div className="mb-2">
                                            <strong>Date:</strong>{' '}
                                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Time:</strong>{' '}
                                            {new Date(appointment.appointmentDate).toLocaleTimeString()}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Status:</strong>{' '}
                                            <Badge bg={getStatusBadgeVariant(appointment.status)}>
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                    </Card.Text>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="primary"
                                            onClick={() => handleShowDetails(appointment)}
                                            className="flex-grow-1"
                                        >
                                            View Details
                                        </Button>
                                        {user?.role === 'buyer' && appointment.status !== 'confirmed' && (
                                            <Button
                                                variant="danger"
                                                onClick={() => handleShowDeleteConfirm(appointment)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Appointment Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                {selectedAppointment && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>Appointment Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={6}>
                                    {selectedAppointment.property?.imageUrls?.[0] && (
                                        <img
                                            src={selectedAppointment.property.imageUrls[0]}
                                            alt={selectedAppointment.property.title}
                                            className="img-fluid rounded mb-3"
                                        />
                                    )}
                                </Col>
                                <Col md={6}>
                                    <h4>{selectedAppointment.property?.title}</h4>
                                    <div className="text-muted">{selectedAppointment.property?.location}</div>
                                    
                                    <div className="mb-3 mt-3">
                                        <strong>Appointment Date:</strong>
                                        <div>{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <strong>Appointment Time:</strong>
                                        <div>{new Date(selectedAppointment.appointmentDate).toLocaleTimeString()}</div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <strong>Status:</strong>
                                        <div>
                                            <Badge bg={getStatusBadgeVariant(selectedAppointment.status)}>
                                                {selectedAppointment.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {selectedAppointment.notes && (
                                        <div className="mb-3">
                                            <strong>Notes:</strong>
                                            <div>{selectedAppointment.notes}</div>
                                        </div>
                                    )}

                                    {user?.role === 'buyer' && selectedAppointment.seller && (
                                        <div className="mb-3">
                                            <strong>Seller:</strong>
                                            <div>{selectedAppointment.seller.name}</div>
                                            <div>{selectedAppointment.seller.email}</div>
                                        </div>
                                    )}

                                    {user?.role === 'seller' && selectedAppointment.buyer && (
                                        <div className="mb-3">
                                            <strong>Buyer:</strong>
                                            <div>{selectedAppointment.buyer.name}</div>
                                            <div>{selectedAppointment.buyer.email}</div>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Close
                            </Button>
                            {user?.role === 'buyer' && selectedAppointment.status !== 'confirmed' && (
                                <Button 
                                    variant="danger"
                                    onClick={() => {
                                        setShowModal(false);
                                        handleShowDeleteConfirm(selectedAppointment);
                                    }}
                                >
                                    Delete Appointment
                                </Button>
                            )}
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteError && (
                        <Alert variant="danger" className="mb-3">
                            {deleteError}
                        </Alert>
                    )}
                    <div>Are you sure you want to delete this appointment?</div>
                    {selectedAppointment && (
                        <div className="mt-3">
                            <div><strong>Property:</strong> {selectedAppointment.property?.title}</div>
                            <div><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</div>
                            <div><strong>Time:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleTimeString()}</div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleDelete}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete Appointment'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Appointments; 