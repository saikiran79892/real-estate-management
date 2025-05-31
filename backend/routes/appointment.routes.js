const express = require('express');
const Appointment = require('../models/appointment.model');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`Appointment Route accessed: ${req.method} ${req.url}`);
    next();
});

// Get buyer's appointments
router.get('/buyer', auth, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'buyer') {
            return res.status(403).json({ message: 'Access denied. Buyers only.' });
        }

        const appointments = await Appointment.find({ buyer: req.user._id })
            .populate({
                path: 'property',
                select: 'title imageUrls location price propertyType'
            })
            .populate('seller', 'name email')
            .sort('-appointmentDate');

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching buyer appointments:', error);
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
});

// Get seller's appointments
router.get('/seller', auth, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access denied. Sellers only.' });
        }

        const appointments = await Appointment.find({ seller: req.user._id })
            .populate({
                path: 'property',
                select: 'title imageUrls location price propertyType'
            })
            .populate('buyer', 'name email')
            .sort('-appointmentDate');

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching seller appointments:', error);
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
});

// Create appointment (buyer only)
router.post('/', auth, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'buyer') {
            return res.status(403).json({ message: 'Only buyers can request appointments' });
        }

        const appointment = new Appointment({
            property: req.body.property,
            buyer: req.user._id,
            seller: req.body.seller,
            appointmentDate: new Date(req.body.appointmentDate),
            message: req.body.message || '',
            status: 'pending'
        });

        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Failed to create appointment' });
    }
});

// Cancel appointment (buyer only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'buyer') {
            return res.status(403).json({ message: 'Only buyers can cancel appointments' });
        }

        const appointment = await Appointment.findOneAndDelete({
            _id: req.params.id,
            buyer: req.user._id,
            status: 'pending'
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found or cannot be cancelled' });
        }

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Failed to cancel appointment' });
    }
});

// Update appointment status (seller only)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Only sellers can update appointment status' });
        }

        const { status } = req.body;
        if (!['confirmed', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const appointment = await Appointment.findOneAndUpdate(
            {
                _id: req.params.id,
                seller: req.user._id
            },
            { status },
            { new: true }
        ).populate('property buyer');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'Failed to update appointment status' });
    }
});

module.exports = router; 