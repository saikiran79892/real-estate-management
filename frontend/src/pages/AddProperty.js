import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'house',
    price: '',
    location: {
      address: '',
      city: '',
      state: ''
    },
    features: {
      bedrooms: '',
      bathrooms: '',
      area: '',
      yearBuilt: ''
    }
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object') {
          Object.keys(formData[key]).forEach(subKey => {
            formDataToSend.append(`${key}.${subKey}`, formData[key][subKey]);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await axios.post('/api/properties', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/manage-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Add New Property</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
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

            <Form.Group className="mb-3">
              <Form.Label>Property Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="land">Land</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <h4>Location</h4>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <h4>Features</h4>
            <Form.Group className="mb-3">
              <Form.Label>Bedrooms</Form.Label>
              <Form.Control
                type="number"
                name="features.bedrooms"
                value={formData.features.bedrooms}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bathrooms</Form.Label>
              <Form.Control
                type="number"
                name="features.bathrooms"
                value={formData.features.bathrooms}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Area (sq ft)</Form.Label>
              <Form.Control
                type="number"
                name="features.area"
                value={formData.features.area}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Year Built</Form.Label>
              <Form.Control
                type="number"
                name="features.yearBuilt"
                value={formData.features.yearBuilt}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Images (Max 5)</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              <Form.Text className="text-muted">
                You can select up to 5 images. Supported formats: JPG, JPEG, PNG
              </Form.Text>
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              className="w-100"
            >
              {loading ? 'Adding Property...' : 'Add Property'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddProperty; 