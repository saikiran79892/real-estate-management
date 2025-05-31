import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreateProperty = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        propertyType: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        status: 'available',
        imageUrls: ['']  // Start with one empty URL input
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // Set up axios authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        
        // Check user role and redirect if not a seller
        if (!user || user.role !== 'seller') {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUrlChange = (index, value) => {
        const newImageUrls = [...formData.imageUrls];
        newImageUrls[index] = value;
        setFormData({ ...formData, imageUrls: newImageUrls });
    };

    const addImageUrl = () => {
        setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] });
    };

    const removeImageUrl = (index) => {
        const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
        setFormData({ ...formData, imageUrls: newImageUrls });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            // Filter out empty URLs
            const filteredImageUrls = formData.imageUrls.filter(url => url.trim() !== '');
            if (filteredImageUrls.length === 0) {
                throw new Error('Please add at least one image URL');
            }

            // Prepare the data
            const propertyData = {
                ...formData,
                imageUrls: filteredImageUrls,
                price: Number(formData.price),
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                area: Number(formData.area)
            };

            // Send the request
            await axios.post('http://localhost:5000/api/properties', propertyData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error creating property:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create property. Please check all fields and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'seller') {
        return null;
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Create New Property</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Property Type</Form.Label>
                            <Form.Select
                                name="propertyType"
                                value={formData.propertyType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="house">House</option>
                                <option value="apartment">Apartment</option>
                                <option value="land">Land</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Bedrooms</Form.Label>
                            <Form.Control
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Bathrooms</Form.Label>
                            <Form.Control
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Area (sq ft)</Form.Label>
                            <Form.Control
                                type="number"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Image URLs</Form.Label>
                    {formData.imageUrls.map((url, index) => (
                        <Row key={index} className="mb-2">
                            <Col>
                                <Form.Control
                                    type="url"
                                    value={url}
                                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                    placeholder="Enter image URL"
                                    required
                                />
                            </Col>
                            <Col xs="auto">
                                <Button
                                    variant="danger"
                                    onClick={() => removeImageUrl(index)}
                                    disabled={formData.imageUrls.length === 1}
                                >
                                    Remove
                                </Button>
                            </Col>
                        </Row>
                    ))}
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={addImageUrl}
                        className="mt-2"
                    >
                        Add Another Image URL
                    </Button>
                    <Form.Text className="text-muted d-block mt-2">
                        Please enter valid image URLs (e.g., https://example.com/image.jpg)
                    </Form.Text>
                </Form.Group>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-100"
                    disabled={loading}
                >
                    {loading ? 'Creating Property...' : 'Create Property'}
                </Button>
            </Form>
        </Container>
    );
};

export default CreateProperty; 