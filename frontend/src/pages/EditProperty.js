import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
        imageUrls: ['']
    });

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/properties/${id}`);
            const property = response.data;
            
            // Verify ownership
            if (property.seller._id !== user._id) {
                navigate('/dashboard');
                return;
            }

            setFormData({
                title: property.title,
                description: property.description,
                price: property.price,
                location: property.location,
                propertyType: property.propertyType,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                area: property.area,
                status: property.status,
                imageUrls: property.imageUrls
            });
        } catch (error) {
            setError('Failed to load property details');
        } finally {
            setLoading(false);
        }
    };

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

            await axios.put(`http://localhost:5000/api/properties/${id}`, propertyData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating property:', error);
            setError(error.response?.data?.message || error.message || 'Failed to update property');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Edit Property</h2>
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
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="pending">Pending</option>
                    </Form.Select>
                </Form.Group>

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

                <div className="d-flex gap-2">
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-grow-1"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Property'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/dashboard')}
                    >
                        Cancel
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default EditProperty; 