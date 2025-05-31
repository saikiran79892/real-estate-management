import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Properties = () => {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchValues, setSearchValues] = useState({
        type: '',
        location: '',
        minPrice: '',
        maxPrice: ''
    });

    const fetchProperties = async (searchParams) => {
        try {
            setLoading(true);
            setError('');
            const params = new URLSearchParams();
            
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await axios.get(`http://localhost:5000/api/properties?${params.toString()}`);
            setProperties(response.data);
        } catch (error) {
            console.error('Error fetching properties:', error);
            setError('Failed to fetch properties');
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchProperties({});
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        await fetchProperties(searchValues);
    };

    const handleClear = () => {
        setSearchValues({
            type: '',
            location: '',
            minPrice: '',
            maxPrice: ''
        });
        fetchProperties({});
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Available Properties</h2>

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Select
                                        name="type"
                                        value={searchValues.type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">All Types</option>
                                        <option value="house">House</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="land">Land</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="location"
                                        value={searchValues.location}
                                        onChange={handleInputChange}
                                        placeholder="Enter location"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Min Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="minPrice"
                                        value={searchValues.minPrice}
                                        onChange={handleInputChange}
                                        placeholder="Min price"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Max Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="maxPrice"
                                        value={searchValues.maxPrice}
                                        onChange={handleInputChange}
                                        placeholder="Max price"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex align-items-end gap-2">
                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    className="mb-3 flex-grow-1"
                                    disabled={loading}
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    type="button"
                                    className="mb-3"
                                    onClick={handleClear}
                                    disabled={loading}
                                >
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Properties Grid */}
            {loading ? (
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {properties.map(property => (
                        <Col key={property._id}>
                            <Card className="h-100 property-card">
                                {property.imageUrls?.[0] && (
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
                                        <div><strong>Location:</strong> {property.location}</div>
                                        <div><strong>Type:</strong> {property.propertyType}</div>
                                        <div><strong>Price:</strong> {formatPrice(property.price)}</div>
                                    </Card.Text>
                                    <Link 
                                        to={`/properties/${property._id}`}
                                        className="btn btn-primary w-100"
                                    >
                                        View Details
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {!loading && properties.length === 0 && (
                <div className="text-center mt-4">
                    <h4>No properties found</h4>
                    <p>Try adjusting your filters to see more results.</p>
                </div>
            )}
        </Container>
    );
};

export default Properties; 