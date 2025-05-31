import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setFormData(prev => ({
                    ...prev,
                    name: response.data.name,
                    email: response.data.email
                }));
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile');
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear messages when user starts typing
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validate passwords if attempting to change
        if (formData.newPassword || formData.currentPassword) {
            if (!formData.currentPassword) {
                setError('Current password is required to set a new password');
                setLoading(false);
                return;
            }
            if (formData.newPassword !== formData.confirmNewPassword) {
                setError('New passwords do not match');
                setLoading(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                name: formData.name,
                email: formData.email
            };

            // Only include password fields if attempting to change password
            if (formData.currentPassword && formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            await axios.put('/api/auth/profile', updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Profile updated successfully');
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));
        } catch (error) {
            console.error('Update error:', error);
            setError(error.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Card className="p-4 shadow">
                <h2 className="text-center mb-4">Profile Settings</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <hr className="my-4" />
                    <h5>Change Password</h5>
                    <Form.Group className="mb-3">
                        <Form.Label>Current Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <div className="d-grid">
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default Profile; 