import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [stats, setStats] = useState({
        totalProperties: 0,
        totalSellers: 0,
        averagePrice: 0
    });
    const [searchParams, setSearchParams] = useState({
        location: '',
        type: '',
        minPrice: '',
        maxPrice: ''
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchFeaturedProperties();
        fetchStats();
    }, []);

    const fetchFeaturedProperties = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/properties/featured');
            setFeaturedProperties(response.data);
        } catch (error) {
            console.error('Error fetching featured properties:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/properties/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const queryParams = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });
        window.location.href = `/properties?${queryParams.toString()}`;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <>
            {/* Hero Section */}
            <div className="bg-primary text-white py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h1 className="display-4 mb-4">Find Your Dream Property</h1>
                            <p className="lead mb-4">
                                Browse through thousands of properties for sale and rent. 
                                Connect with verified sellers and find your perfect home.
                            </p>
                            {!user && (
                                <div className="d-flex gap-3">
                                    <Link to="/register">
                                        <Button variant="light" size="lg">Get Started</Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button variant="outline-light" size="lg">Sign In</Button>
                                    </Link>
                                </div>
                            )}
                        </Col>
                        <Col md={6}>
                            <Card className="shadow">
                                <Card.Body>
                                    <h4 className="mb-4">Search Properties</h4>
                                    <Form onSubmit={handleSearch}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Location</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter city or area"
                                                value={searchParams.location}
                                                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Property Type</Form.Label>
                                            <Form.Select
                                                value={searchParams.type}
                                                onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                                            >
                                                <option value="">All Types</option>
                                                <option value="house">House</option>
                                                <option value="apartment">Apartment</option>
                                                <option value="land">Land</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <Row>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Min Price</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Min"
                                                        value={searchParams.minPrice}
                                                        onChange={(e) => setSearchParams({ ...searchParams, minPrice: e.target.value })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Max Price</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Max"
                                                        value={searchParams.maxPrice}
                                                        onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Button variant="primary" type="submit" className="w-100">
                                            Search Properties
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Stats Section */}
            <Container className="py-5">
                <Row className="text-center">
                    <Col md={4}>
                        <h3 className="display-4 fw-bold text-primary">{stats.totalProperties}</h3>
                        <p className="text-muted">Available Properties</p>
                    </Col>
                    <Col md={4}>
                        <h3 className="display-4 fw-bold text-primary">{stats.totalSellers}</h3>
                        <p className="text-muted">Verified Sellers</p>
                    </Col>
                    <Col md={4}>
                        <h3 className="display-4 fw-bold text-primary">
                            {formatPrice(stats.averagePrice)}
                        </h3>
                        <p className="text-muted">Average Property Price</p>
                    </Col>
                </Row>
            </Container>

            {/* Featured Properties */}
            <Container className="py-5">
                <h2 className="text-center mb-4">Featured Properties</h2>
                <Row xs={1} md={2} lg={3} className="g-4">
                    {featuredProperties.map(property => (
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
                                    </Card.Text>
                                    <Button
                                        as={Link}
                                        to={`/properties/${property._id}`}
                                        variant="primary"
                                        className="w-100"
                                    >
                                        View Details
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

export default Home;